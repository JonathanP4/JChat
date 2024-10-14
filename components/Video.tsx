import { useVideoPlayer, VideoView } from "expo-video";
import { useRef } from "react";

type Props = {
	videoUrl: string;
};

export function Video({ videoUrl }: Props) {
	const ref = useRef(null);
	const player = useVideoPlayer(videoUrl, (player) => {
		player.loop = false;
	});

	return (
		<VideoView
			ref={ref}
			className="w-[300px] h-[275px] mt-2"
			player={player}
			allowsFullscreen
			allowsPictureInPicture
		/>
	);
}
