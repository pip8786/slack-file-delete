import fetch, {Headers} from "node-fetch";
import dotenv from "dotenv";
import {FileListPartial, FilePartial} from "./types";

dotenv.config();

const meta = {
	"Authorization": `Bearer ${process.env.USER_TOKEN}`
};

const headers = new Headers(meta);

const options = {
	headers
};
const monthsToSubtract = 6;
const monthsAgo = new Date();
monthsAgo.setMonth(monthsAgo.getMonth() - monthsToSubtract);
console.log(`Will delete files older than ${monthsAgo.toLocaleDateString()}`);

async function getFileList():Promise<FilePartial[]> {
	let pages = 100;
	let page = 0;
	let files:FilePartial[] = [];
	do {
		page++;
		const params = new URLSearchParams({
			page: page.toString()
		});
		const request = await fetch("https://slack.com/api/files.list?" + params, options);
		const fileList = await request.json() as FileListPartial;
		pages =  fileList.paging.pages;
		console.log(`Fetched ${page} of ${pages}. This page had ${fileList.files.length} file metas.`);
		files = files.concat(fileList.files);
	} while (page < pages);
	const totalSize = files.reduce((acc,file) => acc+file.size,0);
	console.log(`Fetched ${files.length} total file metas with size ${(totalSize/(1024*1024)).toFixed()}mb`);
	return files;
}

async function deleteFiles(files: FilePartial[]): Promise<{count:number, size:number}> {
	const returnObject =  {
		count:0,
		size: 0
	};
	for(let i = 0; i < files.length; i++) {
		const file = files[i];
		if(await deleteFile(file)) {
			returnObject.count++;
			returnObject.size+= file.size;
		}
		await sleep(1000);
		if(i % 100 === 99) {
			console.log(`Deleted ${returnObject.count} files for a total of ${(returnObject.size/(1024*1024)).toFixed(0)}mb so far...`)
		}
	}
	return returnObject;
}

function sleep(ms:number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function deleteFile(file:FilePartial):Promise<boolean> {
	const params = new URLSearchParams({
		file: file.id
	});
	const request = await fetch("https://slack.com/api/files.delete?"+params, options);
	return request.ok;
}


(async() => {
	const files = await getFileList();
	//Timestamps from Slack are in seconds.
	const filteredFiles = files.filter(f => f.created*1000 < monthsAgo.getTime());
	console.log(`We have ${filteredFiles.length} files older than 6 months.`);
	const status = await deleteFiles(filteredFiles);
	console.log(`Done! Deleted ${status.count} files for a total of ${(status.size/(1024*1024)).toFixed(0)}mb.`)
})();