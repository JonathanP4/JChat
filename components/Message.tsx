import { Dimensions, Image, Text, View } from "react-native";

type Props = {
	message: Message;
};
export function Message({ message }: Props) {
	const time = new Date(message.datetime).toLocaleTimeString("en-us", {
		timeStyle: "short",
	});

	return (
		<View className="self-start flex-row bg-slate-600 p-2 mr-auto rounded-r-md space-x-2 mb-2">
			<Image
				className="rounded-full"
				width={40}
				height={40}
				source={{ uri: message.photo }}
			/>
			<View className="space-x-1 max-w-[300px]">
				<Text className="text-white font-bold">{message.name}</Text>
				<Text className="text-white">{message.message}</Text>
				<Text className="text-slate-400 text-xs text-right">{time}</Text>
			</View>
		</View>
	);
}
