/** @jsx React.DOM */

var React  = require('react');
var RR     = require('react-router');
var Routes = RR.Routes;
var Route  = RR.Route;

var routes = (
  <Routes>
    <Route name='app' handler={require('./app')}>
      <Route name='about' path='/' handler={require('./components/about')} />
      <Route name='other' path='/other' handler={require('./components/other')} />
    </Route>
  </Routes>
)

React.renderComponent(routes, document.getElementById('app'));
