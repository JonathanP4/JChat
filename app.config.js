export default {
	expo: {
		name: "JChat",
		slug: "JChat",
		version: "5.2.0",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "myapp",
		userInterfaceStyle: "automatic",
		splash: {
			image: "./assets/images/splash.png",
			resizeMode: "contain",
			backgroundColor: "#0f172a",
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#0f172a",
			},
			googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
			package: "com.john404.JChat",
			softwareKeyboardLayoutMode: "resize",
		},
		plugins: [
			"expo-router",
			"@react-native-firebase/app",
			"@react-native-firebase/auth",
			"expo-video",
			[
				"expo-image-picker",
				{
					photosPermission:
						"The app accesses your photos to let you share them with your friends.",
				},
			],
			[
				"expo-camera",
				{
					cameraPermission: "Allow JChat to access your camera",
					microphonePermission: "Allow JChat to access your microphone",
					recordAudioAndroid: true,
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
		owner: "john404",
		extra: {
			router: {
				origin: false,
			},
			eas: {
				projectId: "4b7f6dd2-aa2f-4c33-9201-9f5c35a9ef03",
			},
		},
	},
};
