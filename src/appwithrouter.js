import React from 'react';
import {  BrowserRouter as Router, withRouter } from "react-router-dom";
import App from './app.js';
import { Helmet } from 'react-helmet';

function AppWithRouter() {
	return (
		<Router>
			<Helmet>
				<title>Bart van de Sande</title>
				<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, user-scalable=0" />
			</Helmet>
            <App />
		</Router>
	);
}


export default AppWithRouter;
