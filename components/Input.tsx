import { TextInput } from "react-native";

type Props = {
	changeText: (t: string) => void;
	value: string;
	placeholder?: string;
	styles?: string;
};

export function Input({ changeText, placeholder, styles, value }: Props) {
	return (
		<TextInput
			placeholderTextColor={"#94a3b8"}
			placeholder={placeholder || ""}
			onChangeText={(txt) => changeText(txt)}
			value={value}
			className={`${
				styles || ""
			} text-slate-300 py-1 px-2 border border-slate-600 bg-slate-800`}
		/>
	);
}
