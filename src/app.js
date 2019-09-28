import React, { useState, useEffect } from 'react';
import {  BrowserRouter as Router , Route, Link, Switch, withRouter } from "react-router-dom";
import './styles/styles.css';

import getRoutes from './data/routesdata.js';

import Nav from './content/nav.js';
import Page from './content/page.js';

import Background from "./background/background";


function App(props) {

	const [routes, setRoutes] = useState([]);
	const [page, setPage] = useState(null);
	const [indexStyles, setIndexStyles] = useState([]);
	const [poke, setPoke] = useState(0);
	const [fadeOut, setFadeOut] = useState({ to : '', hash : 0 });
	const [randomize, setRandomize] = useState(0);
	const [hoverIndexPostId, sethoverIndexPostId] = useState(0);

	useEffect(() => {
		async function fetchRoutes() {
			const routes = await getRoutes();
			setRoutes(routes);
		}
		fetchRoutes();
	}, []); // second [] argument only executes this effect after mounting and not on updates

	const onFadeOut = (nextFadeOut) => {
		// NOTE:
		// it is important that when a fadeout happens, another page will be loaded
		// so fadeout should only be triggered before a page change
		if (nextFadeOut.to !== props.location.pathname)
		{
			// When a fadeout to another page happens, we must clear the index styles
			// to prevent the old index style from influencing the index of the new page
			// the index style will be set again by the background just before the fadein happens
			setIndexStyles([]);
			setFadeOut(nextFadeOut)
		}};

	return (
		<div>
			<Background 

				// whenever these values change, a thing is triggered in background. using performance.now() for diffent values
				poke={poke}
				randomize={randomize}
				fadeOut={fadeOut}
				onHover={(postId) => sethoverIndexPostId(postId)}
				page={page} 
				onIndexStyles={(styles) => setIndexStyles(styles)} />

			<Nav routes={routes} onFadeOut={onFadeOut} />

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
								onFadeOut={onFadeOut}
								onPageLoaded={(page) => setPage(page)}
								onRandomize={setRandomize}
								pageId={route.pageId} />
						
						} />)
				})}

				<Route key="noroute" path="*">
						<Page 
							onPoke={setPoke}
							indexStyles={indexStyles}
							onFadeOut={onFadeOut}
							onPageLoaded={(page) => setPage(page)}
							onRandomize={setRandomize}
							pageId="404" />
				</Route>
			</Switch>
		</div>
	);
}


export default withRouter(App);
