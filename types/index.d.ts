interface MainObject {
	folder: Folder;
	next?: string;
}

interface Folder {
	'@odata.context': string;
	'@odata.nextLink': string;
	value: DriveItem[];
}

interface DriveItem {
	'@odata.etag': string;
	id: string;
	lastModifiedDateTime: string;
	name: string;
	folder?: FolderDetails;
	size: number;
	file?: FileDetails;
	video?: VideoDetails;
}

interface FolderDetails {
	childCount: number;
}

interface FileDetails {
	mimeType: string;
	hashes: {
		quickXorHash: string;
	};
}

interface VideoDetails {
	audioBitsPerSample: number;
	audioChannels: number;
	audioFormat: string;
	audioSamplesPerSecond: number;
	bitrate: number;
	duration: number;
	fourCC: string;
	frameRate: number;
	height: number;
	width: number;
}
