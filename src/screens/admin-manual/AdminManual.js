import React, { useEffect } from "react";
import { Box, Paper, Typography } from "@material-ui/core";
import { connect } from "react-redux";
import pdf from "./adminManual.pdf";

function AdminManual(props) {
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

      window.openPdf = () => {
        window.open(pdf);
      };
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
              href="/images/icons/favicon.ico"
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
  
                button:hover{
                  background-color: #250A52;
              }
      
              .buttonPrint{
                  display: flex;
                  margin: 6px;
                  padding:5px;
                  font-weight: bold;
                  background-color: #6A2BD9;
                  color:#FBF5FE;
                  border: none;
                  font-size-adjust: inherit; 
                  font-size: 15px; 
                  border-radius: 5px; 
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

                .center {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                    
                  }

                h2{ display:none; }
                .logo-white {display: none !important;}
                
                @media only screen and (max-width: 1366px) {
                .content { left: 30%; }
                img {max-width: 500px; } 
                }
  
                
                @media only screen and (max-width: 930px) {
                li,ul,ol { text-indent: 5px;}
                .logo-white {display: flex !important}
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
  
                h2{
                    display: flex;
                }
                
                }
            </style>
        </head>
        
        <body>
        
        <div class="wrapper ">
        <div class="inner fake">
        </div>
        
        <div class="inner fixed">
        
        <ul>
          <li style="text-indent:0;border-bottom: 1px solid rgba(0,0,0,0.18);
          margin-bottom: 10px;padding-bottom:20px;">
          <a href="#admin"><img src="/logo/logo-full.svg" width="60%" class="logo-colored"/></a>
          </li>

          <li><a href="#addclass">Adding a New Class</a></li>
          <li><a href="#understandclass">Understanding the Class Schedule</a></li>
          <li><a href="#accountcreation">Account Creations</a></li>
          <li><a href="#fteachers">For Teachers</a></li>
          <li><a href="#fparents">For Parents</a></li>         
          <li><a href="#fstudents">For Students</a></li>
          <li><a href="#studgroup">Student Group Creation</a></li>
          <li><a href="#addstudgroup">Add a Student into a Student Group</a></li>
          <li><a href="#gradecat">Set Grading Categories</a></li>
          <li><a href="#gradecatpersub">Set Grading Categories Per Subject</a></li>

        </ul>
        </div>
        
        <div class="content">
            <div class="top" style="display: flex;align-items: center;justify-content: flex-end;">
                <div class="logo-white" style="display: flex;margin-left: 13px">
                    <img src="/logo/logo-full.svg" width="150" />
                </div>
                <h1 style="margin:0;margin-right:auto;"><a name="admin">Admin Manual</a></h1>
                <h2 style="color:whitesmoke;">|</h2>
                <button onclick=window.openPdf() class="buttonPrint">
                  PRINT
                </button>    
            </div>
            <hr/>
  
            <div>
                <p>Note: To access the admin panel, hover on the side bar and click this icon:<br/>
                <img src="/images/a_adminpanelbtn.PNG" class="center"/><br/>
                </p>
            </div>
        
            <div>
            <h3><a name="addclass">Adding a New Class</a></h3>
            <p>To add a new class:
            <ol>
            <li>click on “Classes” and select “New Class”.</li><br/>
            <img src="/images/a_addnewclass.PNG" class="center"/><br/>
            <li>Once you are redirected to the “Details” section, fill out the relevant information regarding the
            class.
            Note: Textboxes with “*” emphasizes that these details are required thus it needs to be filled.</li><br/>
            <img src="/images/a_classform.PNG" class="center"/><br/>
            <li>Afterwards, hover over the “Schedules” and fill everything out.</li><br/>
            <img src="/images/a_classsched.PNG" class="center"/><br/>
            <li>Once you’re done, click the “Save” button and the class would be finally created</li><br/>
            <img src="/images/a_saveclass.PNG" class="center"/><br/>
            </ol></p>
            </div>

            <div>
            <h3><a name="understandclass">Understanding the Class Schedule</a></h3>
            <p>Start and End Dates
                <ul>
                <li>Start Date – the date in which the classes will start.</li>
                <li>End Date – the date in which the classes will end.</li>
                </ul>
            <p>Both of these dates are vital when creating a new class in order for the site to determine the
            duration of your classes. If changes shall occur regarding these dates, you can always modify it.</p><br/>
            <img src="/images/a_startend.PNG" class="center"/><br/>
            </p>
            </div>

            <div>
            <h3><a name="accountcreation">Account Creations</a></h3>
            <p>To add an account for teachers, parents, and students, click on “Accounts”.</p><br/>

            <h3><a name="fteachers">For Teachers</a></h3>
                <p>To add a teacher account:
                <ol>
                <li>Click the “Add Teacher” button.</li><br/>
                <img src="/images/a_addteacher.PNG" class="center"/><br/>
                <li>The “Add New Teacher” form will pop-up. Fill-out the necessary details especially with fields
                that has a star (*) in it.</li><br/>
                <img src="/images/a_addteacherf.PNG" class="center"/><br/>
                <li>Once you’re done, click on “Submit”.</li><br/>
                <img src="/images/a_submit.PNG" class="center"/><br/>
                </ol></p>

                <h3><a name="fparents">For Parents</a></h3>
                <p>To add a parent account:
                <ol>
                <li>Click the “Add Parent” button.</li><br/>
                <img src="/images/a_addparent.PNG" class="center"/><br/>
                <li>The “Add New Parent” form will pop-up. Fill-out the necessary details especially with fields
                that has a star (*) in it.</li><br/>
                <img src="/images/a_addparentf.PNG" class="center"/><br/>
                <li>Once you’re done, click on “Submit”.</li><br/>
                <img src="/images/a_submit.PNG" class="center"/><br/>
                </ol></p>

                <h3><a name="fstudents">For Students</a></h3>
                <p>To add a student account:
                <ol/>
                <li>Click the “Add Student” button.</li><br/>
                <img src="/images/a_addstudent.PNG" class="center"/><br/>
                <li>The “Add New Student” form will pop-up. Fill-out the necessary details especially with fields
                that has a star (*) in it.</li><br/>
                <img src="/images/a_addstudentf.PNG" class="center"/><br/>
                <li>Once you’re done, click on “Submit”.</li><br/>
                <img src="/images/a_submit.PNG" class="center"/><br/>
                </ol></p>
            </div>

            <div>
            <h3><a name="studgroup">Student Group Creation</a></h3>
            <p>
            Student Groups are the school administrator’s way to filter or group students according to their sections
            and grade levels. To create a student group, click on the “New Section” button.<br/>
            <img src="/images/a_addnewsection.PNG" class="center"/><br/>
            Type the name of the student group together with the group’s grade level.<br/>
            <img src="/images/a_addnewsectionform.PNG" class="center"/><br/>
            Click on “Submit”.<br/>
            <img src="/images/a_submit.PNG" class="center"/><br/>
            </p>
            </div>

            <div>
            <h3><a name="addstudgroup">Add a Student into a Student Group</a></h3>
            <p>
            To add a student into a certain student group, hover and select the name of the student group and click
            “Add Student”.<br/>
            <img src="/images/a_studgroupname.PNG" class="center"/><br/><img src="/images/a_studgroupadd.PNG" class="center"/><br/>
            Select the student that you wanted to add and click “Add Student” place on the bottom right part of
            the form.<br/>
            <img src="/images/a_studgroupselectstud.PNG" class="center"/><br/><img src="/images/a_addstudgroupaddstudent.PNG" class="center"/><br/>
            </p>
            </div>

            <div>
            <h3><a name="gradecat">Set Grading Categories</a></h3>
            <p>
            To set a grading category, hover over “Grading Categories” tab and click on the “New Category”.<br/>
            <img src="/images/a_addnewcat.PNG" class="center"/><br/>
            Set the category name along with its percentage and click “Save”.<br/>
            <img src="/images/a_setcat.PNG" class="center"/><br/><img src="/images/a_savecat.PNG" class="center"/><br/>
            </p>
            </div>

            <div>
            <h3><a name="gradecatpersub">Set Grading Categories Per Subject</a></h3>
            <p>
            To set a grading category of a certain subject, hover over the “Subject Grading” tab and select the
            subject.<br/>
            <img src="/images/a_setgracesub.PNG" class="center"/><br/>
            Click “New Category”, choose the category name accordingly and set the percentage.<br/>
            <img src="/images/a_addnewcat.PNG" class="center"/><br/> <img src="/images/a_setgradecat.PNG" class="center"/><br/>
            Click “Save”.<br/>
            <img src="/images/a_savecat.PNG" class="center"/><br/>
            </p>
            </div>
      </div>
      </div>
      
        
        <button id="scrolltotop" onclick='
          var scroller = document.querySelector(".wrapper");
          scroller.scrollTop = 0;
            document.documentElement.scrollTop = 0;
          '> Scroll to Top
          </button>
        </body>
        </html>`,
      }}
    ></div>
  );
}

export default connect((states) => ({
  userInfo: states.userInfo,
}))(AdminManual);
