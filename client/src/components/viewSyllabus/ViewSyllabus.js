import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { Link } from "react-router-dom";

class ViewSyllabus extends Component {
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };
render() {
    const { user } = this.props.auth;
return (
    <div style={{ height: "100%", margins: "auto"}}>
    <h4 style={{textAlign:"center"}}>
      <b>View Syllabi</b>
    </h4>
    <p className="flow-text grey-text text-darken-1" style={{textAlign:"center"}}>
      Start browsing and editting the syllabi you made below!
      </p>
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
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem",
                marginLeft: "2rem"
              }}
              onClick={this.onLogoutClick}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>
          </div>
    );
  }
}
ViewSyllabus.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { logoutUser }
)(ViewSyllabus);