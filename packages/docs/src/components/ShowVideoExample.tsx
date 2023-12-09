import React from "react"
export function ShowVideoExample(props: { path: string; filename?: string }) {
	const filename = props.filename ?? "video.webm"

	const path = `/example-videos/${props.path}/${filename}`.replace("//", "/")
	// <source src="/example-videos/user-create-Create-User-chromium/video.webm" type="video/webm" />
	return (
		<video controls width="800px" className="w-full">
			<source src={path} type="video/webm" />
		</video>
	)
}
