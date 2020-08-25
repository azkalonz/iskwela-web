import React, { useEffect } from "react";

function GooglePicker(props) {
  const loadApi = () => {
    let pickerApiLoaded = false;
    let oauthToken;
    var scope = ["https://www.googleapis.com/auth/drive.file"];
    function onAuthApiLoad() {
      window.gapi.auth.authorize(
        {
          client_id:
            "449233625863-1r4lkn9jq0gppnru23lo0uehmgjju06b.apps.googleusercontent.com",
          scope: scope,
          immediate: false,
        },
        handleAuthResult
      );
    }
    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      }
    }
    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }
    function pickerCallback(data) {
      var url;
      var name;
      if (
        data[window.google.picker.Response.ACTION] ===
        window.google.picker.Action.PICKED
      ) {
        var doc = data[window.google.picker.Response.DOCUMENTS][0];
        url = doc[window.google.picker.Document.URL];
        name = doc[window.google.picker.Document.NAME];
      }
      if (url && name) {
        props.onSelect({
          url,
          name,
        });
        props.onClose();
      }
    }
    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var view = new window.google.picker.View(
          window.google.picker.ViewId.DOCS
        );
        var picker = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
          .enableFeature(window.google.picker.Feature.SUPPORT_TEAM_DRIVES)
          .setAppId(
            "449233625863-1r4lkn9jq0gppnru23lo0uehmgjju06b.apps.googleusercontent.com"
          )
          .setOAuthToken(oauthToken)
          .addView(view)
          .addView(new window.google.picker.DocsUploadView())
          .setDeveloperKey("AIzaSyCMaV_zOzBTWn7LdiaiOMrWuoBo6DiBZPM")
          .setCallback(pickerCallback)
          .build();
        picker.setVisible(true);
      }
    }

    window.gapi.load("auth", { callback: onAuthApiLoad });
    window.gapi.load("picker", { callback: onPickerApiLoad });
  };
  useEffect(() => {}, [props.open]);
  return <div></div>;
}

export default GooglePicker;
