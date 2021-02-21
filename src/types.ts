export type FilePartial = {
	id: string
	created: number
	size: number
};

export type FileListPartial = {
	files: FilePartial[]
	paging: {
		count: number
		total: number
		page: number
		pages: number
	}
};