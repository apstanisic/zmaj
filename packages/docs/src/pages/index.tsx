import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import HomepageFeatures from "@site/src/components/HomepageFeatures"
import Layout from "@theme/Layout"
import { clsx } from "clsx"
import React from "react"

import styles from "./index.module.css"

export default function Home(): JSX.Element {
	const { siteConfig } = useDocusaurusContext()
	return (
		<Layout title={`${siteConfig.title}`} description="Zmaj is simple to use CMS">
			<header className={clsx("hero hero--primary", styles.heroBanner)}>
				<div className="container">
					<h1 className={clsx("hero__title")}>{siteConfig.title}</h1>
					<img
						src="/logo.svg"
						style={{
							height: 180,
							width: 180,
							filter: "grayscale(1)",
						}}
					/>
					<p
						style={{
							maxWidth: 600,
							marginLeft: "auto",
							marginRight: "auto",
							fontSize: "1.5rem",
						}}
					>
						{siteConfig.tagline}
					</p>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Link className="button button--secondary button--lg" to="/docs">
							Go to the documentation
						</Link>
					</div>
				</div>
			</header>

			<main>
				<div
					style={{
						padding: 40,
						display: "flex",
						justifyContent: "center",
						width: "100%",
					}}
				>
					<div style={{ maxWidth: 900, width: "100%" }}>
						<div style={{ padding: "47.47% 0 0 0", position: "relative" }}>
							<iframe
								src="https://player.vimeo.com/video/802065159?h=b00d10489f&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
								frameBorder={0}
								allow="autoplay; fullscreen; picture-in-picture"
								allowFullScreen
								style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
								title="Zmaj add record"
							></iframe>
						</div>
						<script src="https://player.vimeo.com/api/player.js"></script>
					</div>
				</div>
				<HomepageFeatures />
			</main>
		</Layout>
	)
}
