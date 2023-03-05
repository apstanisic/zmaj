import React from "react"
import { clsx } from "clsx"
import styles from "./styles.module.css"

type FeatureItem = {
	title: string
	description: JSX.Element
}

const FeatureList: FeatureItem[] = [
	{
		title: "Headless CMS",
		description: <>Zmaj provides RESTfull API, so you can use it as a headless CMS.</>,
	},
	{
		title: "Admin Panel",
		description: <>Admin panel is provides so you can configure your app easily.</>,
	},
	{
		title: "Built on stable foundation",
		description: (
			<>
				Built on top of React and React Admin for admin panel, <br /> and NestJS and Sequelize for
				API.
			</>
		),
	},
]

function Feature({ title, description }: FeatureItem): JSX.Element {
	return (
		<div className={clsx("col col--4 text--center margin-vert--sm")}>
			<div className="card padding---md" style={{ height: "100%" }}>
				<div className="card__header">
					<h3>{title}</h3>
				</div>
				<div className="card__body">
					<p>{description}</p>
				</div>
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
