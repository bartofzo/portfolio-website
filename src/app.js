import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { Helmet } from 'react-helmet';
import './styles/styles.css';

import getRoutes from './data/routesdata.js';

import Nav from './content/nav.js';
import Page from './content/page.js';

import Background from "./background/background";


function App() {

	const [routes, setRoutes] = useState([]);
	const [pageInfo, setPageInfo] = useState([]);
	const [indexStyles, setIndexStyles] = useState([]);
	const [hoverIndexPostId, sethoverIndexPostId] = useState(0);


	useEffect(() => {
		async function fetchRoutes() {
			const routes = await getRoutes();
			setRoutes(routes);
		}
		fetchRoutes();
	}, []); // second [] argument only executes this effect after mounting and not on updates


	return (
		<Router>
			<Helmet>
				<title>Bart van de Sande</title>
				<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, user-scalable=0" />
			</Helmet>

			<Background 
				onHover={(postId) => sethoverIndexPostId(postId)}
				pageInfo={pageInfo} 
				onIndexStyles={(styles) => setIndexStyles(styles)} />

			<Nav routes={routes} />

			<Switch>
				{routes.map((route, index) => {
					return (
					<Route
						key={index}
						exact path={route.path}
						render={() => 

							<Page 
								hoverIndexPostId={hoverIndexPostId}
								indexStyles={indexStyles}
								onPageLoaded={(pageInfo) => setPageInfo(pageInfo)}
								pageId={route.pageId} />
						
						} />)
				})}
				{/* 
					<Route
					key='404'
					path='*'
					render={() => 
						<Page 
							hoverIndex={hoverIndex}
							indexStyles={indexStyles}
							onPageLoaded={(pageInfo) => setPageInfo(pageInfo)}
							pageId='404' />
					
					} /> */ }
			</Switch>

		</Router>
	);
}


export default App;
