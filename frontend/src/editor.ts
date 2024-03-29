import Note from "./api/wrapper/note";

export default class Editing {
    editor: MediumEditor;
    interval: number;
    lastSaved: Date;
    currentNote: Note;
    constructor () {
        this.editor = null;
    }

    createEditor (note: Note) {
        $("#target").removeClass("d-none");
        $("#toolbar").removeClass("d-none");

        this.currentNote = note;
        this.editor = new MediumEditor('#target', {
            toolbar: false, /* {
                buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'subscript',
                    'superscript',
                    'orderedlist',
                    'unorderedlist',
                    'anchor',
                    'h1',
                    'h2',
                    'h3',
                    'quote',
                    'table'
                ],
            }, */
            keyboardCommands: {
                commands: [
                    {
                        command: 'bold',
                        key: 'B',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                        command: 'italic',
                        key: 'I',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                        command: 'underline',
                        key: 'U',
                        meta: true,
                        shift: false,
                        alt: false
                    }
                ],
            },
            extensions: {
              table: new MediumEditorTable()
            },
            placeholder: false,
            autoLink: true
        });

        const content = this.currentNote.content;

        if (content !== null) {
            // Load previous data
            $("#target").html(content)
        } else {
            // Default data
            $("#target").html("<p>Get started by writing here!</p>")
        }

        const that = this;
        this.editor.subscribe('editableInput', async (_event, _editable) => {
            $("#saved").addClass("d-none").removeClass("d-inline-flex");
            $("#not-saved").addClass("d-inline-flex").removeClass("d-none");
        });

        this.interval = setInterval(async () => {
            await this.save();

            $("#not-saved").addClass("d-none").removeClass("d-inline-flex");
            $("#saved").addClass("d-inline-flex").removeClass("d-none");
        }, 5000) as unknown as number;
    }

    async save() {
        const newContent = $("#target").html();
        if (this.currentNote && this.currentNote.content !== newContent) {
            this.lastSaved = new Date();
            await this.currentNote.setContent(newContent);
        }
    }

    destroyEditor() {
        if (this.editor !== null) {
            $("#toolbar").addClass("d-none");
            $("#target").addClass("d-none");


            this.editor.destroy();
            this.editor = null;
        }

        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.lastSaved = null;
        this.currentNote = null;
    }
}

export function addToolbarListener(editor: Editing) {
    $(".toolbar-button").on("click", function () {
        editor.editor.execAction($(this).data("action"))
    })
}
