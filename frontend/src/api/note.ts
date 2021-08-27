import API from "./api";
import APIChild from "./child"
import { INote } from "./objects/note";
import { ISubject } from "./objects/subject";


export interface INoteProps {
    title: string,
    content: string,
    label: number[]
}

export default class APINote extends APIChild {
    constructor(api: API) {
        super(api);
    }

    async all(subjectId: number): Promise<INote[]> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "notes"), "GET"
        )

        return (await this.validateResponse(response)).notes;
    }

    async create(subjectId: number, { title, content, label }: INoteProps): Promise<ISubject> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "notes"), "POST",
            this.createForm({
                title,
                content,
                label
            })
        )

        return await this.validateResponse(response);
    }

    async get(subjectId: number, noteId: number): Promise<INote> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "note", noteId.toString()), "GET"
        )

        return await this.validateResponse(response);
    }
}