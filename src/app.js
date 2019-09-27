import React, { useState, useEffect } from 'react';
import {  BrowserRouter as Router , Route, Link, Switch } from "react-router-dom";
import { Helmet } from 'react-helmet';
import './styles/styles.css';

import getRoutes from './data/routesdata.js';

import Nav from './content/nav.js';
import Page from './content/page.js';

import Background from "./background/background";


function App() {

	const [routes, setRoutes] = useState([]);
	const [page, setPage] = useState(null);
	const [indexStyles, setIndexStyles] = useState([]);
	const [poke, setPoke] = useState(0);
	const [fadeOut, setFadeOut] = useState(0);
	const [randomize, setRandomize] = useState(0);
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

				// whenever these values change, a thing is triggered in background. using performance.now() for diffent values
				poke={poke}
				randomize={randomize}
				fadeOut={fadeOut}
				onHover={(postId) => sethoverIndexPostId(postId)}
				page={page} 
				onIndexStyles={(styles) => setIndexStyles(styles)} />

			<Nav routes={routes} onFadeOut={(fadeOut) =>{ 

				// When a fadeout to another page happens, we must clear the index styles
				// to prevent the old index style from influencing the index of the new page
				// the index style will be set again by the background just before the fadein happens

				// NOTE:
				// it is important that when a fadeout happens, another page will be loaded
				// so fadeout should only be triggered before a page change

				setIndexStyles([]);
				setFadeOut(fadeOut)}

				 }/>

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
								onPoke={setPoke}
								onPageLoaded={(page) => setPage(page)}
								onRandomize={setRandomize}
								pageId={route.pageId} />
						
						} />)
				})}
			</Switch>

		</Router>
	);
}


export default App;
