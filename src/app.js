import React, { useState, useEffect } from 'react';
import {  BrowserRouter as Router , Route, Link, Switch, withRouter } from "react-router-dom";
import './styles/styles.css';
import getRoutes from './fetch/routesdata.js';
import Nav from './components/content/nav.js';
import Footer from './components/content/footer.js';
import Page from './components/content/page.js';
import Background from "./components/background/background.js";
import { isMobile } from 'mobile-device-detect';

function App(props) {

	const [routes, setRoutes] = useState([]);
	const [page, setPage] = useState(null);
	const [indexStyles, setIndexStyles] = useState([]);
	const [poke, setPoke] = useState(0);
	const [fadeOut, setFadeOut] = useState({ to : '', hash : 0 });
	const [randomize, setRandomize] = useState(0);
	const [multiplier, setMultiplier] = useState(isMobile ? .29 : 1); // mobile less detail
	const [currentAnchor, setCurrentAnchor] = useState(null);

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
			//console.log(props.location.pathname);
			//console.log(nextFadeOut.to);
			// When a fadeout to another page happens, we must clear the index styles
			// to prevent the old index style from influencing the index of the new page
			// the index style will be set again by the background just before the fadein happens
			setIndexStyles([]);
			
			setCurrentAnchor(nextFadeOut.anchor);
			setFadeOut(nextFadeOut);
		}};

	return (
		<div>
			<Background 

				// whenever these values change, a thing is triggered in background. using performance.now() for different values
				poke={poke}
				randomize={randomize}
				multiplier={multiplier}
				fadeOut={fadeOut}
				// onHover={(postId) => sethoverIndexPostId(postId)}
				page={page} 
				onIndexStyles={(styles) => setIndexStyles(styles)} />

			<Nav routes={routes} onFadeOut={onFadeOut} />
			

			<Switch>
				{ routes.map((route, index) => {

					return (<Route 
						exact path={route.path}
						key={index} 
						render={() => 
							
							<Page 
								pageId={route.pageId}
								onPoke={setPoke}
								indexStyles={indexStyles}
								onFadeOut={onFadeOut}
								onPageLoaded={(page) => setPage(page)}
								onRandomize={setRandomize}

								multiplier={multiplier}
								onMultiplier={setMultiplier}
								anchor={currentAnchor}
							/>
				} />)

				})}

				<Route key="noroute" path="*">
					<Page 
						pageId="404"
						onPoke={setPoke}
						indexStyles={indexStyles}
						onFadeOut={onFadeOut}
						onPageLoaded={(page) => setPage(page)}
						onRandomize={setRandomize}

						multiplier={multiplier}
						onMultiplier={setMultiplier}
					/>
				</Route>
			</Switch>

		</div>
	);
}


export default withRouter(App);
