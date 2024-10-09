import { Auth } from "@/store/Auth";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

type Props = {
	message: Message;
};
export function Message({ message }: Props) {
	const { user } = Auth();
	const time = new Date(message.datetime).toLocaleTimeString("en-us", {
		timeStyle: "short",
	});
	const [isFromCurrentUser, setIsFromCurrentUser] = useState(false);

	useEffect(() => {
		setIsFromCurrentUser(message.id === user?.uid);
	}, []);

	return (
		<View
			className={`${
				isFromCurrentUser
					? "self-end rounded-l-md bg-slate-600"
					: "self-start rounded-r-md bg-slate-800"
			} flex-row  p-2 space-x-2 mb-2 min-w-[170px]`}
		>
			<Image
				className="rounded-full"
				width={40}
				height={40}
				source={{ uri: message.photo }}
			/>
			<View className="space-x-1 max-w-[300px] flex-1">
				<Text className="text-white font-bold">{message.name}</Text>
				<Text className="text-white">{message.message}</Text>
				<Text className="text-slate-400 text-xs text-right">{time}</Text>
			</View>
		</View>
	);
}
