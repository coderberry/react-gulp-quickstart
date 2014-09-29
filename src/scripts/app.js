/** @jsx React.DOM */

var React = require('react');
var Link  = require('react-router').Link;

var App = module.exports = React.createClass({

  render: function() {
    return (
      <div>
        <h1>React QuickStart</h1>
        <Link to='about'>About</Link>
        <Link to='other'>Other</Link>
        <this.props.activeRouteHandler />
      </div>
    )
  }

});
