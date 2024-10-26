type User = {
	email: string;
	id: string;
	profile_picture: string;
	username: string;
	expo_push_token: string;
	online: boolean;
};

type Message = {
	datetime: string;
	message?: string;
	media?: Media;
	index?: number;
	userID: string;
	id: string;
	name: string;
	photo: string;
	replying?: { user: string; message?: string; media?: Media; index: number };
};

interface FirebaseData {
	title?: string;
	message?: string;
	subtitle?: string;
	sound?: boolean | string;
	vibrate?: boolean | number[];
	priority?: AndroidNotificationPriority;
	badge?: number;
}

type Media = {
	width: string;
	height: string;
	url: string;
	filename: string;
	type: "image" | "video" | "audio" | undefined;
};
