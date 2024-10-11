export default {
	expo: {
		name: "JChat",
		slug: "JChat",
		version: "3.0.0",
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
		},
		plugins: [
			"expo-router",
			"@react-native-firebase/app",
			"@react-native-firebase/auth",
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
