import React from "react"
import { clsx } from "clsx"
import styles from "./styles.module.css"

type FeatureItem = {
	title: string
	Svg?: React.ComponentType<React.ComponentProps<"svg">>
	description: JSX.Element
}

const FeatureList: FeatureItem[] = [
	{
		title: "RESTful API",
		// Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
		description: <>Zmaj provides RESTfull API, so you can use it as a headless CMS.</>,
	},
	{
		title: "Admin Panel",
		// Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
		description: <>Admin panel is provides so you can configure your app easily.</>,
	},
	{
		title: "Built on stable foundation",
		// Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
		description: (
			<>
				Using React and React Admin for admin panel, <br /> and NestJS and Sequelize for API.
			</>
		),
	},
]

function Feature({ title, Svg, description }: FeatureItem) {
	return (
		<div className={clsx("col col--4")}>
			<div className="text--center">{/* <Svg className={styles.featureSvg} role="img" /> */}</div>
			<div className="text--center padding-horiz--md">
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
		</div>
	)
}

export default function HomepageFeatures(): JSX.Element {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	)
}
