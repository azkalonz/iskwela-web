import React, { useState, useCallback } from "react";
import Api from "../api";
import { connect } from "react-redux";
import { fetchData } from "./Admin/Dashboard"; // ibalhin lang unya ni ang export sa fetchData, kay sa Admin/Dashboard naku ni gi export, pwede ni ixport adto sa api/index.js para mas appropriate

function ApiExample(props) {
  const states = [
    { name: "userInfo", data: props.userInfo },
    { name: "parentData", data: props.parentData },
  ];
  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <h1>Stored Variables in Redux</h1>
      <div style={{ height: 300, overflow: "auto" }}>
        <ul>
          {states.map((state, index) => (
            <li key={index}>
              <h2>{state.name}</h2>
              <pre>
                <code>{JSON.stringify(state.data, undefined, 2)}</code>
              </pre>
            </li>
          ))}
        </ul>
      </div>
      <h1>GET Request</h1>
      <GetRequest />
    </div>
  );
}

// GET request example
function GetRequest(props) {
  const [request, setRequest] = useState({});
  const [loading, setLoading] = useState(false);

  const sendRequest = useCallback(() => {
    fetchData({
      before: () => {
        setLoading(true);
      },
      // omit {{url}} since gi set na naku daan sa code ang url
      send: async () => await Api.get(request.url),
      after: (data) => {
        setLoading(false);
        setRequest({ ...request, response: data });
      },
    });
  }, [request, loading]);
  //lainee???
  //oo wa ko nakasunod kay gisugo ko huhuhuhu
  //check messenger laine
  //unsay naa loading kaau gyud nayabag nagyud ning signal sa amo
  // i try ug request ang sa web app /api/teacher/classes?user_id=1
  // welcome lalaine 👏👏
  // so gamit kaayo ang postman, makita ninyo ang response bisan wala pa mo UI
  //yepp
  // buhaton sa ko to ang gi send ni ate jen ban
  // i explore lang sa ni ang GET request
  // i try ug gamit ang ubang endpoints sa postman
  //ok mark, i end na ni nako inig hawa ninyo xD
  //ok markkk, salamatt
  // mo reconnect ra unya ko
  return (
    <div>
      <input
        onChange={(e) => setRequest({ ...request, url: e.target.value })}
      />
      <button onClick={() => setRequest({})}>Reset</button>
      <button onClick={() => sendRequest()}>Send Request</button>
      {loading ? (
        <div>sending request...</div>
      ) : (
        request.response && (
          <div>
            <pre>
              <code>{JSON.stringify(request.response, undefined, 2)}</code>
            </pre>
          </div>
        )
      )}
    </div>
  );
}
// POST request example
function PostRequest(props) {}
// DELETE request example
function DeleteRequest(props) {}

export default connect((states) => ({
  userInfo: states.userInfo,
  parentData: states.parentData, // stores user_type "a" / "p"'s children (anak sa parent/ teachers under ni admin)
  // parentData.childInfo <--- current child
  // parentData.children <--- array of children
  classes: states.classes,
  classDetails: states.classDetails,
}))(ApiExample);
