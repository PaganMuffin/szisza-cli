import React from 'react';
import {Box, Text, useInput} from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import fs from 'fs';

export default function App() {
	useInput((input, key) => {
		if (key['delete']) {
			if (currentPath !== '/') {
				const newPath = currentPath.split('/');
				newPath.pop();
				setCurrentPath(newPath.join('/'));
			}
		} else if (input === 'c') {
			setDownloading(false);
		} else if (input === 'q') {
			process.exit();
		}
	});

	//DOWNLOADING
	const [downloading, setDownloading] = React.useState(false);
	const [downloadingProgress, setDownloadingProgress] = React.useState(0);
	const [currectDownloadFile, setCurrentDownloadFile] = React.useState('');
	//NORMAL
	const [state, setState] = React.useState<DriveItem[]>([]);
	const [currentPath, setCurrentPath] = React.useState('/');
	const [isLoading, setIsLoading] = React.useState(false);

	const getListByPath = async (path: string) => {
		setIsLoading(true);
		const currentUrl = 'https://shisha-subs.eu/api?path=' + path;
		const response = await fetch(currentUrl, {
			headers: {
				accept: 'application/json, text/plain, */*',
				'accept-language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
				'cache-control': 'no-cache',
				pragma: 'no-cache',
				priority: 'u=1, i',
				'sec-ch-ua':
					'"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
				'sec-ch-ua-arch': '"x86"',
				'sec-ch-ua-bitness': '"64"',
				'sec-ch-ua-full-version': '"132.0.6834.197"',
				'sec-ch-ua-full-version-list':
					'"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.197", "Google Chrome";v="132.0.6834.197"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-model': '""',
				'sec-ch-ua-platform': '"Windows"',
				'sec-ch-ua-platform-version': '"10.0.0"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
			},
			referrer: 'https://shisha-subs.eu/archive',
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: null,
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
		});

		if (response.status != 200) {
			console.log(await response.text());
			console.log('Error: ' + response.status);
			throw new Error('Error: ' + response.status);
		}

		const data = (await response.json()) as MainObject;
		let list = data.folder.value;
		let isNext = data.next;
		while (isNext) {
			const next = await getNext(currentUrl, isNext);
			list = [...list, ...next.folder.value];
			isNext = next.next;
		}

		setState(list);
		setIsLoading(false);
	};

	const getNext = async (currentUrl: string, next: string) => {
		const fullUrl = currentUrl + '&next=' + next;
		const response = await fetch(fullUrl, {
			headers: {
				accept: 'application/json, text/plain, */*',
				'accept-language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
				'cache-control': 'no-cache',
				pragma: 'no-cache',
				priority: 'u=1, i',
				'sec-ch-ua':
					'"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
				'sec-ch-ua-arch': '"x86"',
				'sec-ch-ua-bitness': '"64"',
				'sec-ch-ua-full-version': '"132.0.6834.197"',
				'sec-ch-ua-full-version-list':
					'"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.197", "Google Chrome";v="132.0.6834.197"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-model': '""',
				'sec-ch-ua-platform': '"Windows"',
				'sec-ch-ua-platform-version': '"10.0.0"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
			},
			referrer: 'https://shisha-subs.eu/archive',
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: null,
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
		});

		return await response.json();
	};

	React.useEffect(() => {
		getListByPath(currentPath);
	}, [currentPath]);

	const onSelect = (item: {
		label: string;
		value: DriveItem & {file: boolean};
		key: string | undefined;
	}) => {
		if (item.key == 'all') {
			downloadAllFiles();
		} else {
			if (item.value.file) {
				console.log('Pobieranie pliku: ' + item.value.name);
				let filePath = '';
				if (currentPath === '/') {
					filePath = currentPath + item.value.name;
				} else {
					filePath = currentPath + '/' + item.value.name;
				}
				downloadFile(filePath, item.value.name);
				console.log('Kliknij `c` aby wrócić do listy plików');
			} else {
				if (currentPath === '/') {
					setCurrentPath(currentPath + item.value.name);
				} else {
					setCurrentPath(currentPath + '/' + item.value.name);
				}
			}
		}
	};

	const generateItemsList = () => {
		let list = state.map(item => {
			const file = item.file || false;
			const size = item.size / 1024 / 1024;
			const name =
				(!file ? '📁' : '🗎') +
				' ' +
				item.name +
				(file ? ' - ' + size.toFixed(2) + 'MB' : '');
			return {
				label: name,
				value: {
					...item,
					file,
				},
				key: item.id,
			};
		});

		const containsFiles = list.some(item => item.value.file);
		if (!containsFiles) {
			return list;
		}

		return [
			{
				label: '⤓ Pobierz wszystkie pliki',
				value: {
					name: 'Pobierz wszystkie pliki',
					file: false,
				},
				key: 'all',
			},
			...list,
		];
	};

	//DOWNLOADING
	const downloadFile = async (
		path: string,
		filename: string,
		downloadPath?: string,
	) => {
		setDownloading(true);
		setCurrentDownloadFile(filename);
		const url = `https://shisha-subs.eu/api/raw?path=${path}`;
		const response = await fetch(url, {
			redirect: 'manual',
		});

		const fileUrl = response.headers.get('location');

		const fileResponse = await fetch(fileUrl!);

		const total = parseInt(
			fileResponse.headers.get('content-length') || '0',
			10,
		);
		const reader = fileResponse.body!.getReader();
		let received = 0;

		//SAve file to disk and show progress

		const finalPath = downloadPath ? downloadPath + '/' + filename : filename;
		const writer = fs.createWriteStream(finalPath);
		while (true) {
			const {done, value} = await reader.read();
			if (done) {
				break;
			}
			if (value) {
				received += value.length;
				const progress = (received / total) * 100;
				setDownloadingProgress(progress);
				writer.write(value);
			}
		}

		console.log('Pobrano plik: ' + filename);
	};

	const downloadAllFiles = async () => {
		const files = state.filter(item => item.file);
		const currentFolder = currentPath.split('/').pop()!;
		if (!fs.existsSync(currentFolder)) {
			fs.mkdirSync(currentFolder);
		}
		for (const file of files) {
			const filePath = currentPath + '/' + file.name;
			await downloadFile(filePath, file.name, currentFolder);
		}
		console.log('Kliknij `c` aby wrócić do listy plików');
	};

	return (
		<Box flexDirection="column" gap={1}>
			{!downloading && (
				<Box flexDirection="column">
					<Text>Szisza Downloader</Text>

					<Text>Obecna lokalizacja {currentPath}</Text>
					{isLoading && (
						<Text color={'green'}>
							<Spinner type="dots" />
							<Text> Ładowanie...</Text>
						</Text>
					)}
					{!isLoading && (
						<SelectInput
							limit={10}
							//@ts-ignore
							items={generateItemsList()}
							//@ts-ignore
							onSelect={onSelect}
						/>
					)}
				</Box>
			)}
			{downloading && (
				<Box flexDirection="column">
					<Text>Pobieranie pliku: {currectDownloadFile}</Text>
					<Box gap={1}>
						<Text>Pobrano</Text>
						<Box>
							{Array.from({length: 20}, (_, i) => (
								<Text
									key={i}
									color={i < downloadingProgress / 5 ? 'green' : 'gray'}
								>
									#
								</Text>
							))}
						</Box>
						<Text>{downloadingProgress.toFixed(0)}%</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
}
