import React, { useEffect } from "react";
import { Box, Paper, Typography } from "@material-ui/core";
import { connect } from "react-redux";

function UserManual(props) {
  return (
    <Box>
      <HTML />
    </Box>
  );
}

function HTML(props) {
  useEffect(() => {
    try {
      var toppings = document.getElementById("scrolltotop");
      var scroller = document.querySelector(".wrapper");
      scroller.addEventListener("scroll", scrollToTop);

      function scrollToTop() {
        if (
          scroller.scrollTop > 20 ||
          document.documentElement.scrollTop > 20
        ) {
          toppings.style.display = "block";
        } else {
          toppings.style.display = "none";
        }
      }
      var collapse = document.getElementsByClassName("collapsible");
      var i;

      for (i = 0; i < collapse.length; i++) {
        collapse[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content) {
            if (content.style.display === "block") {
              content.style.display = "none";
            } else {
              content.style.display = "block";
            }
          }
        });
      }
    } catch (e) {}
  }, []);
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!doctype html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>iSkwela | User Manual</title>
          <link
          rel="icon"		
            sizes="48x48"
            type="image/x-icon"
            href="/images/user-manual/icons/favicon.ico"
          />
          <style type="text/css">
              * {
                  box-sizing: border-box;
                  scroll-behavior: smooth;
                }
              
              p {
                  padding-left:4%;
                  line-height: 2;
                }
                .content p {
                    font-family: Arial;
                }
                
              li,ul,ol { text-indent: 10px;}
              
              ul { list-style-type: none; }
              
              h1 { 
                  text-align: center;
                  color: #6A2BD9;
                 }
              
              span { font-weight: bold;}
              
              img { 
                   max-height: 500px;
                   max-width:1000px;
                  }
      
              button {
                  display:none;
              }
      
              .wrapper{
                  display:flex;
                  height: 100vh;
                  overflow: auto;
              }
                  
              a {
                  text-decoration: none;
                  color: #6A2BD9;
              }
              .inner a {
                  color: #fff;
                  font-size: 17px;
                  line-height: 32px
              }
              .inner {
                  background-color:#6a2bd9;
                  min-width: 330px;
              }
              .inner.fixed {
                  position: fixed;
                  padding: 20px;
                  padding-top: 5px;
                  left:0;
                  bottom:0;
                  height: 100vh;
                  overflow: auto;
                  top:0;
              }
              .inner.fixed ul {
                  padding-inline-start: 0px;
              }
              a:hover{
                  opacity: 0.7;
                  cursor: pointer;
                  font-weight: bold;
              }
      
              .collapsible{
                  text-indent: -2px;
              }
      
              .dropdown-content {
                  padding: 0 18px;
                    display: none;
                    overflow: hidden;
              }
              .content {
                  padding: 60px;
                  padding-top: 40px;
              }
              .logo-white {display: none!important;}
              
              @media only screen and (max-width: 1366px) {
              .content { left: 30%; }
              img {max-width: 500px; } 
              }
              
              @media only screen and (max-width: 930px) {
              li,ul,ol { text-indent: 5px;}
              .logo-white {display: flex!important}
              .logo-colored {
                  display: none;
              }
              
              img {max-width: 100%; }
      
              .wrapper{
                  display: flex;
                  clear: both;
                  flex-wrap: wrap;
              }
              .inner {
                  width: 100%;
                  margin-top: 105px;
              }
              .inner.fake {
                  display: none;
              }
              .inner.fixed {
                  position: relative;
                  height: auto;
              }
              
              div {
                  align-items: center;
                  clear: both;
              }
              
              .content{
                  left:0;
                  z-index:1;
              }
              h1{
                  color: white;
                  text-align: center;
                  padding: 20px;
              }
              
              
              .top{
                  position: fixed;
                  background-color:#6A2BD9; 
                  width: 100%;
                  height: 100px;
                  box-shadow: 0 4px 6px rgba(189, 101, 248, 0.486);
                  left:0;top:0;right:0;
              }
      
              #scrolltotop{
                  display: none; 
                    position: fixed; 
                    bottom: 20px; 
                    right: 30px; 
                    z-index: 99; 
                    border: none; 
                    outline: none; 
                    background-color: #6A2BD9;
                    color: white;   
                    padding: 15px; 
                    border-radius: 10px; 
                    font-size: 20px;
              }
              
              }
          </style>
      </head>
      
      <body>
      <a name="iskwela"></a>
      
      <div class="wrapper ">
      <div class="inner fake">
      </div>
      <div class="inner fixed">
      <ul>
          <li style="text-indent:0;border-bottom: 1px solid rgba(0,0,0,0.18);
          margin-bottom: 20px;"><h2><a href="#iskwela">
              <img src="/logo/logo-full.svg" width="60%" class="logo-colored"/>
          </a></h2></li>
          <li><a href="#account_creation"> Account Creation </a></li>
          <li><a href="#login"> Login </a></li>
          
          <li>
              <div class="collapsible clearfix"><a>▸Passwords</a></div>
              <div class="dropdown-content">
              <a href="#changepass">Password Change </a>
              </div>
          </li>
      
          <li>
              <div class="collapsible"><a>▸Dashboard</a></div>
              <div class="dropdown-content">
                  <div><a href="#search_classes"> Search Classes </a></div>
                  <div><a href="#quick_access"> Quick Access </a></div>
                  <div><a href="#dark_mode"> Dark Mode </a></div>
                  <div><a href="#profile_picture"> Profile Picture </a></div>
                  <div><a href="#chatdash"> Chat </a></div>
              </div>
          </li>
      
          <li>
              <div class="collapsible"><a>▸View Class</a></div>
              <div class="dropdown-content">
                  <div><a href="#class_info"> Class Information </a></div>
                  <div><a href="#class_menus"> Class Menus </a></div>
                  <div><a href="#start_class"> Start, Join, and End Class </a></div>
              </div>
          </li>
      
          <li>
              <div class="collapsible"><a>▸Video Conferencing and Chat</a></div>
              <div class="dropdown-content">
                  <div><a href="#full_screen"> Full Screen View </a></div>
                  <div><a href="#vid_and_mic"> Video and Microphone </a></div>
                  <div><a href="#share_screen"> Share Screen </a></div>
                  <div><a href="#chat"> Chat </a></div>
                  <div><a href="#raisehand">Raise Hand</a></div>
                  <div><a href="#toggleview">Toggle View</a></div>
                  <div><a href="#livestream">Live Stream</a></div>
              </div>
          </li>
      
          <li><a href="#posts">Posts</a></li>
      
          <li>
              <div class="collapsible"><a>▸Student Activities</a></div>
              <div class="dropdown-content">
                  <div><a href="#add_new_act"> Add New Activity </a></div>
                  <div><a href="#publish_activity"> Publish Activity </a></div>
                  <div><a href="#whiteboard">White Board</a></div>
                  <div><a href="#kahoot">Kahoot</a></div>
              </div>
          </li>
      
          <li>
              <div class="collapsible"><a>▸Questionnaires</a></div>
              <div class="dropdown-content">
                  <div><a href="#viewq">View Questionnaire</a></div>
                  <div><a href="#createq">Create Questionnaire</a></div>
              </div>
          </li>
      
          <li><a href="#instructional"> Instructional Materials </a></li>
      
          <li>
              <div class="collapsible"><a>▸Lesson Plan</a></div>
                      <div class="collapsible dropdown-content">
                      <div class="collapsible"><a>▸Add New File</a></div>
                      <div class="dropdown-content">
                          <a href="#gdrive">Google Drive</a><br/>
                          <a href="#web_link"> Web Link </a><br/>
                          <a href="#file_upload"> File Upload </a><br/>
                      </div>
                  <a href="#view_upload"> View Uploaded Files </a>
              </div>
          </li>
      
          <li>
              <div class="collapsible"><a>▸Reports</a></div>
              <div class="dropdown-content">
                  <div><a href="#attendance">Attendance</a></div>
                  <div><a href="#scores">Scores</a></div>
              </div>
          </li>
      
          <li><a href="#sched"> Schedule </a></li>
          <li><a href="#student"> Student </a></li>
      </ul>
      </div>
      
      <div class="content">
          <div class="top" style="display: flex;align-items: center;justify-content: flex-start;">
              <div class="logo-white" style="display: flex;margin-left: 13px">
                  <img src="/logo/logo-full.svg" width="150" />
                  <h1>|</h1>
              </div>
              <h1 style="margin:0;">User Manual</h1>
          </div>
          <hr/>
      <div>
      <h2><a name="account_creation"> Account Creation </a></h2>
          <p>
              iSkwela team will register the school once both sides come to an agreement. <br />
              All members of the school, administrators, teachers, and students will be given an account.<br/> 
              iSkwela will provide the account details to the school administrator.
          </p>
      </div>	
      
          
      <div>
      <h2><a name="login"> Login </a></h2>
          <p>
              To login successfully, follow these steps:
              <ol>
                  <li>Open your browser.</li>
                  <li>Enter this link <a href="https://portal.iskwela.net">https://portal.iskwela.net</a></li>
                  <li>Enter your valid username and password.</li>
                  <li>Click the <span>SIGN IN</span> button.</li>
              </ol>
          </p>
          <p>Login is the same for school admin, teacher and student.<br/>
             <img src="/images/user-manual/signin.png"/></p>
      </div>
      
      <div>
      <h2><a>Passwords</a></h2>
          <p>
              For the security purposes of the accounts, all users are required to change 
              their respective passwords at least once every six (6) months. 
              <h3><a name="changepass">Password Change</a></h3>
              <p>To change you password:</p>
              <ol>
                  <li>Click the dropdown icon on the upper right side and choose "Preferences".</li><br/>
                  <img src="/images/user-manual/preferences.png"/><br/>
                  <li>You will be redirected to the change password window.<br/> 
                   Fill out the form with your old and new password then click<span>SAVE</span>.</li><br/>
                  <img src="/images/user-manual/changepass.png"/>
              </ol>
          </p>
      </div>
      
      <div>	
      <h2> <a name="dashboard">Dashboard</a> </h2>
          <p>
          After a successful login, the dashboard or home page is displayed with all the upcoming classes.<br/>
          <img src="/images/user-manual/dashboard.png"/>
          </p>
          
          
          <h3><a name="search_classes"> Search Classes </a></h3>
              <p>
                  You can look for a specific class by entering some texts on the search field at the right side.<br/>
                  <img src="/images/user-manual/search_class.png"/>
              </p>
              
          
          <h3><a name="quick_access"> Quick Access </a></h3>
              <p>
                  Classes can easily be accessed through the menu bar at the left side.
                  <br/><img src="/images/user-manual/quick access.png"/>
              </p>
              
          
          <h3><a name="dark_mode"> Dark Mode </a></h3>
              <p>
                  You can choose to display the app in dark mode by following these steps.
                  <ol>
                      <li>Click on the options icon.</li>
                      <img src="/images/user-manual/options.png"/>
                      <li>Select Dark Mode On.</li>
                      <img src="/images/user-manual/darkmode.png"/>
                  </ol>
              </p>
              <p>You can also turn it off by following the same procedure.</p>
                  
          <h3><a name="profile_picture"> Profile Picture </a></h3>
              <p>
                  Upload a profile picture by following these steps.
                  <ol>
                      <li>Click the<span>UPLOAD</span>button.</li>
                      <li>Browse your profile picture.</li>
                      <li>Click the<span>SAVE</span>button.</li>
                      <img src="/images/user-manual/profile.png"/>
                  </ol>
              </p>
              
          <h3><a name="chatdash">Chat</a></h3>
              <p>
                  Students and teacher can connect to each other to discuss about personal matters through chat.<br/>
                  To go to chats, click the messages icon.<br/>
                  <img src="/images/user-manual/chat icon.png"/><br/>
                  <img src="/images/user-manual/chat.png"/>
              </p>
      </div>
      
      <div>	
      <h2> View Class </h2>
          <p>
              There are two (2) ways to open and view the class.
              <ol>
                  <li>Click the class widget in the dashboard main panel.</li>
                  <img src="/images/user-manual/viewclass1.png"/>
                  <li>Click the class icon in the menu bar at the left side.</li>
                  <img src="/images/user-manual/viewclass2.png"/>
              </ol>
          </p>
          <p>Class details will be displayed on this page.
             <img src="/images/user-manual/classdetails.png"/></p>
          
          
          <h3><a name="class_info"> Class Information </a></h3>
              <p>
                  At the upper left side is the information about the class.
                  <ol>
                      <li>Class name</li>
                      <li>Class image - can be changed</li>
                      <li>Schedule - date and time</li>
                      <li>Teacher name</li>
                      <li>Start Class button</li>
                      <img src="/images/user-manual/classinfo.png"/>
                  </ol>
              </p>
          
          <h3><a name="class_menus"> Class Menus </a></h3>
              <p>
                  These are the available menus of the class :
                  <ol>
                      <li>Posts</li>
                      <li>Student Activities - for class seatworks, projects, quizzes, periodical tests, or assignments.
                      It also has a white board feature where the teacher can write</li>
                      <li>Questionnaires</li>
                      <li>Instructional Materials</li>
                      <li>Lesson Plan</li>
                      <li>Reports - to trace absences and scores of students.</li>
                      <li>Schedule - list of class schedules</li>
                      <li>Students - list of students credentials</li>
                      <img src="/images/user-manual/classmenu.png"/>
                  </ol>
              </p>
          
          <h3><a name="start_class"> Start, Join, and End Class </a></h3>
              <p>
                  Click this button to start the class.<br/>
              <em>Note : Only teachers can start a class. Students can join in the class once it is started.</em><br/>
                  <img src="/images/user-manual/startclass.png"/><br/>
                  A video conference will open once the class is started.<br/>
                  <img src="/images/user-manual/startclassvid.png"/><br/>
                  On the other hand, students will click on<span>Join Class</span>button in order to join.<br/>
                  <img src="/images/user-manual/joinclass.png"/><br/>
                  Finally, when the teacher wants to end the class, he or she can simply click the<span>End Class</span> button.<br/>
                  <img src="/images/user-manual/endclass.png"/>
                  
              </p>
      </div>
          
      <div>
      <h2> Video Conferencing and Chat </h2>
          <p>
              This video conference can handle upto 50 participants only as of the moment.<br/>
              <img src="/images/user-manual/vidconference.png"/>
          </p>
          
          <h3><a name="full_screen"> Full Screen View </a></h3>
              <p>
                  The video conference can be displayed as full screen by clicking this button.<br/>
                  <img src="/images/user-manual/fullscreen1.png"/><img src="/images/user-manual/fullscreen.png"/>
              </p>
          
          <h3><a name="vid_and_mic"> Video and Microphone </a></h3>
              <p>
                  Once the video conference starts, a pop-up message will be shown by the browser.<br/>
                  This is asking you to allow the video conference to use your computer’s or device’s microphone and camera for the video.<br/>
                  <em>Note : The Allow button must be clicked, otherwise you need to close the browser window and open the app again.</em><br/>
                  <img src="/images/user-manual/allowvidandmic.png"/><br/>
                  Both the microphone and camera can be turned on and off.<br/>
                  <em>Note : It is advisable that all participants turn on their video for a more effective class.</em><br/>
                  <img src="/images/user-manual/camandmic.png"/>
              </p>
          
          <h3><a name="share_screen"> Share Screen </a></h3>
              <p>
                  To share your screen, click on the leftmost button.<br/>
                  <img src="/images/user-manual/sharescreen.png"/><br/>
                  There are 3 options available for screen sharing.
                  <ol>
                      <li>Your Entire Screen - allows you to share all open apps in your device</li>
                      <li>Application Window - allows you to share a certain app only, example : browser.</li>
                      <li>Chrome Tab - the current browser you are using.</li><br/>
                      <img src="/images/user-manual/sharescreenoptions.png"/>
                  </ol>
              </p>
              <p>Once the Share button is clicked, the video conference will show your screen.<br/>
              <img src="/images/user-manual/sharescreenstart.png"/></p>
              
          
          <h3><a name="chat"> Chat </a></h3>
              <p>
                  Click the chat icon to initiate the chat box.<br/>
                  <img src="/images/user-manual/chatconference.png"/>
              </p>
              
          <h3><a name="raisehand">Raise Hand</a></h3>
              <p>To have an interactive conference, the raise hand feature was made.<br/>
                 If a student wants to participate or ask a question, he or she can click the raise/lower hand button.<br/>
              <img src="/images/user-manual/raisehand.png"/>
              </p>
              
          <h3><a name="toggleview">Toggle View</a></h3>
              <p>To change from one view to another, click the toggle button.<br/>
              <img src="/images/user-manual/toggle.png"/>
              </p>
          
          <h3><a name="livestream">Live Stream</a></h3>
              <p>To start a live stream, click on the three dots on the right side and choose "Live Stream".<br/>
                 It will prompt you to enter your live stream key, which can be found on your youtube account.<br/>
              <img src="/images/user-manual/fullscreen1.png"/>
              <img src="/images/user-manual/startlivestream.png"/>
              </p>
      </div>	
      
      <div>
      <h2><a name="posts">Posts</a></h2>
          <p>
          Teachers can post announcements and updates in this feature. 
          <img src="/images/user-manual/posts.png"/>
          </p>
      </div>
      
      <div>
      <h2> Student Activities </h2>
          <p>
              Teachers can create different types of activity, while students can only view and submit a file.<br/>
              The activities are listed with the latest one on top.<br/>
              Activities can be seat works, projects, quizzes, periodical tests, quizzes, and assignments.<br/>
              <img src="/images/user-manual/studentactivities.png"/>
          </p>
          
          <h3><a name="add_new_act"> Add New Activity </a></h3>
              <p>
                  To add an activity follow these steps :
                  <ol>
                      <li>Enter a title.</li>
                      <li>Enter a description. This can be your instructions for the activity.</li>
                      <li>Enter from and to date.</li>
                      <li>
                          Optional : add a file or a link.
                          <ol>
                              <li>Add file will ask you to browse a file.</li>
                              <li>Add link will ask you to enter a link.</li>
                          </ol>
                      </li>
                      <li>Click the save button if you want to just save it without sharing to the class.</li>
                      <li>Click the publish button if you want to share it to the entire class.</li>
                  </ol>
              </p>
              <p><em>Note : After creating the activity, you can still publish or unpublish it.</em><br/>
              <img src="/images/user-manual/addquiz.png"/><img src="/images/user-manual/addact.png"/>
              <img src="/images/user-manual/addproj.png"/><img src="/images/user-manual/addtest.png"/><img src="/images/user-manual/addassign.png"/>
              <img src="/images/user-manual/activityform.png"/></p>
          
          <h3><a name="publish_activity"> Publish Activity </a></h3>
              <p>
                  To publish an activity, you can do either of the following :
                  <ol>
                      <li>Click the<span>PUBLISH</span>button upon adding new activity.</li>
                      <li>Choose an activity, click the … icon and choose Publish from the option.</li>
                      <img src="/images/user-manual/publishactivity.png"/>
                  </ol>
              </p>
              <p>The published activity will be shared to all students under the class.</p>
              
          <h3><a name="whiteboard">White Board</a></h3>
              <p>White board is a virtual board where teachers can draw and write notes regarding the discussion.<br/>
              <img src="/images/user-manual/whiteboard.png"/>
              </p>
              
          <h3><a name="kahoot">Kahoot</a></h3>
              <p>Kahoot is a game-based learning platform that enables teachers to provide a fun and creative medium of learning through games.<br/>
              <img src="/images/user-manual/kahoot.png"/>
              </p>
      </div>
      
      <div>
      <h2>Questionnaires</h2>
          <p>
              <h3><a name="viewq">View Questionnaire</a></h3>
              <p>Displays all the questionnaires that the teacher have made.<br/>
              <img src="/images/user-manual/vieq.png"/></p>
              
              <h3><a name="createq">Create Questionnaire</a></h3>
              <p>To create a questionnaire, under the Questionnaires menu, select<span>Create Questionnaire</span>.<br/>
              <img src="/images/user-manual/createq.png"/></p>
          </p>
      </div>
      
      <div>
      <h2><a name="instructional"> Instructional Materials </a></h2>
          <p>
              Holds all the instructional materials for the class.<br/> 
              This is the same the lesson plan, teachers can add a web link or upload a file.<br/>
              <img src="/images/user-manual/instructional.png"/>
          </p>
      </div>
      
      <div>	
      <h2> Lesson Plan </h2>
          <p>
               The teacher's guide for the students' course of learning. This is not viewable by students.<br/>
              <img src="/images/user-manual/lessonplan.png"/>
          </p>
          
          <h3> Add New File</h3>
              <p>
                  Teachers can upload their lesson plans on this page or just add in the link.<br/>
                  <img src="/images/user-manual/lessonplanaddfile.png"/>
                      
                      <h3><a name="gdrive">Google Drive</a><br/>
                      <img src="/images/user-manual/googledrive.png"/>
                      </h3>
                      
                      <h3><a name="web_link"> Web Link </a><br/>
                          <img src="/images/user-manual/weblink.png"/>
                      </h3>
          
                      <h3><a name="file_upload"> File Upload </a><br/>
                      <img src="/images/user-manual/fileupload.png"/>
                      </h3>
                      
              </p>
              
          <h3><a name="view_upload"> View Uploaded File </a></h3>
              <p>
                  Uploaded files can be viewed by clicking on the file link.<br/>
                  It can be downloaded or printed.<br/>
                  <img src="/images/user-manual/viewfile.png"/>
              </p>
      </div>
      
      <div>
      <h2>Reports</h2>
          <p>
              <h3><a name="attendance">Attendance</a></h3>
                  <p>Keeps track of the students absences and presence in the class.</p><br/>
                  <img src="/images/user-manual/attendance.png"/>
                  
              <h3><a name="scores">Scores</a></h3>
                  <p>Contains the list of students' scores from different activities.</p><br/>
                  <img src="/images/user-manual/scores.png"></a>
          </p>
      </div>
      
      <div>	
      <h2><a name="sched"> Schedule </a></h2>
          <p>
              This is the list of schedules for the specific class. It shows the ff:
              <ol>
                  <li>Date</li>
                  <li>Time</li>
                  <li>Teacher Name - since class can be re-assigned to a teacher</li>
                  <li>Status</li>
                  <img src="/images/user-manual/schedules.png"/>
              </ol>
              
          </p>
      </div>
      
      <div>
      <h2><a name="student"> Students List </a></h2>
          <p>
              This contains a list of students under the specific class.<br/>
              It includes the student's additional information such as phone number and email for the teacher's reference should he or she needs to contact the student.<br/>
              <img src="/images/user-manual/students.png"/>
          </p>
      </div>
      </div>
      </div>
      </div>
      
      <button id="scrolltotop" onclick='
        var scroller = document.querySelector(".wrapper");
        scroller.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        '> Scroll to Top</button>
      </body>
      </html>`,
      }}
    ></div>
  );
}

export default connect((states) => ({
  userInfo: states.userInfo,
}))(UserManual);