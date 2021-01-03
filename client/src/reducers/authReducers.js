//reducers are pure functions that specify how an app state should change in response to an action, such as a clicking of a button
//reducers respond with the new state, which is passed to our store, then to our UI
//so, we will first import ~actions~
//next we will define our initialState, then we define how our state should change based on actions via a switch statement

import {
    SET_CURRENT_USER,
    USER_LOADING
  } from "../actions/types";
  const isEmpty = require("is-empty");
  const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false
  };

// eslint-disable-next-line import/no-anonymous-default-export
export default function(state = initialState, action) {
switch (action.type) {
    case SET_CURRENT_USER:
    return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
    };
    case USER_LOADING:
    return {
        ...state,
        loading: true
    };
    default:
    return state;
}
}