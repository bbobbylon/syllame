import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { Link } from "react-router-dom";
import axios from "axios";

class CreateSyllabus extends Component {
  constructor(props) {
    super(props);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeInstructorName = this.onChangeInstructorName.bind(this);
    this.onChangeCourseNumber = this.onChangeCourseNumber.bind(this);
    this.onChangeCreditHours = this.onChangeCreditHours.bind(this);
    this.onChangeOfficeNumber = this.onChangeOfficeNumber.bind(this);
    this.onChangeOfficeHours = this.onChangeOfficeHours.bind(this);
    this.onChangePhoneNumber = this.onChangePhoneNumber.bind(this);
    this.onChangeEmailAddress = this.onChangeEmailAddress.bind(this);
    this.onChangeCourseDescription = this.onChangeCourseDescription.bind(this);
    this.onChangeMeetingTimes= this.onChangeMeetingTimes.bind(this);
    this.onChangeMeetingLocation = this.onChangeMeetingLocation.bind(this);
    this.onChangeCourseMaterials = this.onChangeCourseMaterials.bind(this);
    this.onChangeCourseSchedule = this.onChangeCourseSchedule.bind(this);
    this.onChangeGradingScale = this.onChangeGradingScale.bind(this);
    this.onChangeExtraInfo = this.onChangeExtraInfo.bind(this);




    this.state = {
      title: '',
      instructorName: '',
      courseNumber: '',
      creditHours: '',
      officeNumber: '',
      officeHours: '',
      phoneNumber: '',
      emailAddress: '',     
      courseDescription: '',
      meetingTimes: '',
      meetingLocation: '',
      courseMaterials: '',
      courseSchedule: '',
      gradingScale: '',
      extraInfo: ''
    };


  }
  onChangeTitle(e) {
    this.setState({title: e.target.value})
  }
  onChangeInstructorName(e) {
    this.setState({instructorName: e.target.value})
  }
  onChangeCourseNumber(e) {
    this.setState({courseNumber: e.target.value})
  }
  onChangeCreditHours(e) {
    this.setState({creditHours: e.target.value})
  }
  onChangeOfficeNumber(e) {
    this.setState({officeNumber: e.target.value})
  }
  onChangeOfficeHours(e) {
    this.setState({officeHours: e.target.value})
  }
  onChangePhoneNumber(e) {
    this.setState({phoneNumber: e.target.value})
  }
  onChangeEmailAddress(e) {
    this.setState({emailAddress: e.target.value})
  }
  onChangeCourseDescription(e) {
    this.setState({courseDescription: e.target.value})
  }
  onChangeMeetingTimes(e) {
    this.setState({meetingTimes: e.target.value})
  }
  onChangeMeetingLocation(e) {
    this.setState({meetingLocation: e.target.value})
  }
  onChangeCourseMaterials(e) {
    this.setState({courseMaterials: e.target.value})
  }
  onChangeCourseSchedule(e) {
    this.setState({courseSchedule: e.target.value})
  }
  onChangeGradingScale(e) {
    this.setState({gradingScale: e.target.value})
  }
  onChangeExtraInfo(e) {
    this.setState({extraInfo: e.target.value})
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };



/*
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  
*/



  onSubmit(e){
    e.preventDefault()

    const templateObject = {
      title: this.state.title,
      instructorName: this.state.instructorName,
      courseNumber: this.state.courseNumber,
      courseCreditHours: this.state.courseCreditHours,
      officeNumber: this.state.officeNumber,
      officeHours: this.state.officeHours,
      phoneNumber: this.state.phoneNumber,
      emailAddress: this.state.emailAddress,
      courseDescription: this.state.courseDescription,
      meetimgTimes: this.state.meetingTimes,
      meetingLocation: this.state.meetingLocation, 
      courseMaterials: this.state.courseMaterials,
      gradingScale: this.state.gradingScale,
      extraInfo: this.state.extraInfo

    };
    console.log(templateObject)
    axios.post('http://localhost:5000/templates/add' , templateObject)
    .then(res => console.log(res.data));
    console.log('Template succesfully created !')
    //this.setState({title: '' , instructorName:'' , courseNumber:'' , creditHours:'' , officeNumber:'', officeHours:'' , phoneNumber:'' , emailAddress:'' , courseDescription:'', meetingTimes:'' , meetingLocation:'', courseMaterials:'', courseSchedule:'' , gradingScale:'' , extraInfo:''})
  }
  
  
render() {
return (
      <div style={{ height: "100%", margins: "auto"}}>
            <h4 style={{textAlign:"center"}}>
              <b>Create Syllabus</b>
            </h4>
            <p className="flow-text grey-text text-darken-1" style={{textAlign:"center"}}>
              Fill out the information below to start making your syllabus!
              </p>
              <form>
                <div>
                  <label>Class Title: </label>
                  <br />
                  <input type="text" name="title" onChange={this.onChangeTitle} onSubmit = {this.onSubmit} value={this.state.title} />
                </div>
                <br/>
                <div>
                  <label>Instructor's Name: </label>
                  <br />
                  <input type="text" name="instructorName" onChange={this.onChangeInstructorName} onSubmit = {this.onSubmit} value={this.state.instructorName} />
                </div>
                <br/>
                <div>
                  <label>Course Number: </label>
                  <br />
                  <input type="text" name="courseNumber" onChange={this.onChangeCourseNumber} onSubmit = {this.onSubmit} value={this.state.courseNumber} />
                </div>
                <br/>
                <div>
                  <label>Course Credit Hours: </label>
                  <br />
                  <select ref="creditHours"
                    required
                    value={this.state.creditHours}
                    onChange={this.onChangeCreditHours}>
                    <option
                      key={1}
                      value={1}>{1}
                    </option>
                    <option
                      key={2}
                      value={2}>{2}
                    </option>
                    <option
                      key={3}
                      value={3}>{3}
                    </option>
                    <option
                      key={4}
                      value={4}>{4}
                    </option>
                    <option
                      key={5}
                      value={5}>{5}
                    </option>
                  </select>
                </div>
                <br/>
                <div>
                  <label>Office Number: </label>
                  <br />
                  <input type="text" name="officeNumber" onChange={this.onChangeOfficeNumber} onSubmit = {this.onSubmit} value={this.state.officeNumber} />
                </div>
                <br/>
                <div>
                  <label>Office Hours: </label>
                  <br />
                  <input type="text" name="officeHours" onChange={this.onChangeOfficeHours}  onSubmit = {this.onSubmit} value={this.state.officeHours} />
                </div>
                <br/>
                <div>
                  <label>Phone number: </label>
                  <br />
                  <input type="text" name="phoneNumber" onChange={this.onChangePhoneNumber}  onSubmit = {this.onSubmit} value={this.state.phoneNumber} />
                </div>
                <br/>
                <div>
                  <label>Email Address: </label>
                  <br />
                  <input type="text" name="emailAddress" onChange={this.onChangeEmailAddress} onSubmit = {this.onSubmit} value={this.state.emailAddress} />
                </div>
                <br/>
                <div>
                  <label>Course Description: </label>
                  <br />
                  <input type="text" name="courseDescription" onChange={this.onChangeCourseDescription} onSubmit = {this.onSubmit} value={this.state.courseDescription} />
                </div>
                <br/>
                <div>
                  <label>Course Meeting Times: </label>
                  <br />
                  <input type="text" name="meetingTimes" onChange={this.onChangeMeetingTimes} onSubmit = {this.onSubmit} value={this.state.meetingTimes} />
                </div>
                <br/>
                <div>
                  <label>Course Meeting Location: </label>
                  <br />
                  <input type="text" name="meetingLocation" onChange={this.onChangeMeetingLocation} onSubmit = {this.onSubmit} value={this.state.meetingLocation} />
                </div>
                <br/>
                <div>
                  <label>Course Materials: </label>
                  <br />
                  <input type="text" name="courseMaterials" onChange={this.onChangeCourseMaterials} onSubmit = {this.onSubmit} value={this.state.courseMaterials} />
                </div>
                <br/>
                <div>
                  <label>Course Schedule: </label>
                  <br />
                  <input type="text" name="courseSchedule" onChange={this.onChangeCourseSchedule} onSubmit = {this.onSubmit} value={this.state.courseSchedule} />
                </div>
                <br/>
                <div>
                  <label>Grading Scale: </label>
                  <br />
                  <input type="text" name="gradingScale" onChange={this.onChangeGradingScale} onSubmit = {this.onSubmit} value={this.state.gradingScale} />
                </div>
                <br/>
                <div>
                  <label>Extra Information: </label>
                  <br />
                  <input type="text" name="extraInfo" onChange={this.onChangeExtraInfo} onSubmit = {this.onSubmit} value={this.state.extraInfo} />
                </div>
                <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "2rem",
                float: "left"
              }}
              
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              type= "submit"
            >
              Submit
            </button>


              </form>
         
            <Link
                to="/dashboard"
                style={{
                  width: "150px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px",
                  marginTop: "2rem",
                  float: "right"
                }}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
                Home
              </Link>
          </div>
    );
  }
}
CreateSyllabus.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { logoutUser }
)(CreateSyllabus);
