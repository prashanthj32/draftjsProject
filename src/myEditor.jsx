import React, {useState } from 'react';
import { Editor, EditorState, Modifier, RichUtils, convertToRaw, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { convertToHTML } from 'draft-convert';


const RichEditorExample = () => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const [htmlData, setHtmlData] = useState("<p>Hello CKEditor 5!</p>")

    const focus = () => editorRef.current.focus();

    const onChange = (newEditorState) => setEditorState(newEditorState);

    const handleKeyCommand = (command) => {

        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const captureData = () => {


        const htmlResult = convertToHTML({
            styleToHTML: (style) => {
                if (style === 'red') {
                    return <span style={{ color: 'rgba(255, 0, 0, 1.0)' }} />;
                }else if(style === 'orange'){
                    return <span style={{ color: 'rgba(255, 127, 0, 1.0)' }} />;
                }else if(style === 'yellow'){
                    return <span style={{ color: 'rgba(180, 180, 0, 1.0)' }} />;
                }else if(style === 'green'){
                    return <span style={{ color: 'rgba(0, 180, 0, 1.0)' }} />;
                }else if(style === 'blue'){
                    return <span style={{ color: 'rgba(0, 0, 255, 1.0)' }} />;
                }else if(style === 'indigo'){
                    return <span style={{ color: 'rgba(75, 0, 130, 1.0)' }} />;
                }else if(style === 'violet'){
                    return <span style={{ color: 'rgba(127, 0, 225, 1.0)' }} />;
                }
                else{
                    return <span style={{ color: 'black' }} />;

                }

            },
        })(editorState.getCurrentContent());


        setHtmlData(htmlResult);

    };

    const mapKeyToEditorCommand = (e) => {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(e, editorState, 4); /* maxDepth */
            if (newEditorState !== editorState) {
                setEditorState(newEditorState);
            }
            return;
        }
        return getDefaultKeyBinding(e);
    };

    const toggleBlockType = (blockType) => {
        setEditorState(RichUtils.toggleBlockType(editorState, blockType));
    };

    const toggleInlineStyle = (inlineStyle) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    };

    // Custom overrides for "code" style.
    // const styleMap = {
    //     CODE: {
    //         backgroundColor: 'rgba(0, 0, 0, 0.05)',
    //         fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    //         fontSize: 16,
    //         padding: 2,
    //     },
    // };

    const getBlockStyle = (block) => {
        switch (block.getType()) {
            case 'blockquote':
                return 'RichEditor-blockquote';
            default:
                return null;
        }
    };

    const editorRef = React.createRef();

    const toggleColor = (toggledColor) => {
        const selection = editorState.getSelection();

        const nextContentState = Object.keys(colorStyleMap).reduce((contentState, color) => {
            return Modifier.removeInlineStyle(contentState, selection, color);
        }, editorState.getCurrentContent());

        let nextEditorState = EditorState.push(
            editorState,
            nextContentState,
            'change-inline-style'
        );

        const currentStyle = editorState.getCurrentInlineStyle();

        if (selection.isCollapsed()) {
            nextEditorState = currentStyle.reduce((state, color) => {
                return RichUtils.toggleInlineStyle(state, color);
            }, nextEditorState);
        }

        if (!currentStyle.has(toggledColor)) {
            nextEditorState = RichUtils.toggleInlineStyle(
                nextEditorState,
                toggledColor
            );
        }

        setEditorState(nextEditorState);
    };

    return (
        <div>

            <div className="RichEditor-root">
                <BlockStyleControls editorState={editorState} onToggle={toggleBlockType} />
                <InlineStyleControls editorState={editorState} onToggle={toggleInlineStyle} />
                <ColorControls editorState={editorState} onToggle={toggleColor} />
                <div className="RichEditor-editor" onClick={focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={colorStyleMap}
                        editorState={editorState}
                        handleKeyCommand={handleKeyCommand}
                        keyBindingFn={mapKeyToEditorCommand}
                        onChange={onChange}
                        placeholder="Tell a story..."
                        ref={editorRef}
                        spellCheck={true}
                    />
                </div>
            </div>
            <button onClick={captureData}>Capture Data</button>
            <div>
                <h2>CKEditor 5 Example</h2>
                <CKEditor
                    editor={DecoupledEditor}
                    data={htmlData}
                    onReady={editor => {
                        // You can store the "editor" and use when it is needed.
                        editor.ui
                            .getEditableElement()?.parentElement.insertBefore(
                                editor.ui.view.toolbar.element,
                                editor.ui.getEditableElement()
                            );
                    }}
                    onInit={(editor) => {
                        // You can listen to the editor initialization here
                    }}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                    }}
                    config={{
                        toolbar: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'fontColor',
                            'fontSize', // Add FontSize button to the toolbar
                            '|',
                            'bulletedList',
                            'numberedList',
                            'alignment',
                            '|',
                            'link',
                            'undo',
                            'redo',
                            '|',
                            'color', // Add Color button to the toolbar
                        ],
                        heading : {
                            options: [
                                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                                { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                                { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                                { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
                            ]
                        }
                    }}
                />
            </div>
        </div>


    );
};

// Rest of the components (StyleButton, BlockStyleControls, InlineStyleControls)
// ...

export default RichEditorExample;

const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

var INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

const ColorControls = ({ editorState, onToggle }) => {
    const currentStyle = editorState.getCurrentInlineStyle();

    return (
        <div style={styles.controls}>
            {COLORS.map(type =>
                <ColorButtons
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

const ColorButtons = ({ onToggle, style, active, label }) => {
    const handleToggle = (e) => {
        e.preventDefault();
        onToggle(style);
    };

    let styleObj = { ...styles.styleButton };
    if (active) {
        styleObj = { ...styleObj, ...colorStyleMap[style] };
    }

    return (
        <span style={styleObj} onMouseDown={handleToggle}>
            {label}
        </span>
    );
};

const StyleButton = ({ onToggle, style, active, label }) => {
    const handleToggle = (e) => {
        e.preventDefault();
        onToggle(style);
    };

    let className = 'RichEditor-styleButton';
    if (active) {
        className += ' RichEditor-activeButton';
    }

    return (
        <span className={className} onMouseDown={handleToggle}>
            {label}
        </span>
    );
};

const COLORS = [
    { label: 'Red', style: 'red' },
    { label: 'Orange', style: 'orange' },
    { label: 'Yellow', style: 'yellow' },
    { label: 'Green', style: 'green' },
    { label: 'Blue', style: 'blue' },
    { label: 'Indigo', style: 'indigo' },
    { label: 'Violet', style: 'violet' },
];

const colorStyleMap = {
    red: { color: 'rgba(255, 0, 0, 1.0)' },
    orange: { color: 'rgba(255, 127, 0, 1.0)' },
    yellow: { color: 'rgba(180, 180, 0, 1.0)' },
    green: { color: 'rgba(0, 180, 0, 1.0)' },
    blue: { color: 'rgba(0, 0, 255, 1.0)' },
    indigo: { color: 'rgba(75, 0, 130, 1.0)' },
    violet: { color: 'rgba(127, 0, 255, 1.0)' },
};

const styles = {
    root: {
        fontFamily: '\'Georgia\', serif',
        fontSize: 14,
        padding: 20,
        width: 600,
    },
    editor: {
        borderTop: '1px solid #ddd',
        cursor: 'text',
        fontSize: 16,
        marginTop: 20,
        minHeight: 400,
        paddingTop: 20,
    },
    controls: {
        fontFamily: '\'Helvetica\', sans-serif',
        fontSize: 14,
        marginBottom: 10,
        userSelect: 'none',
    },
    styleButton: {
        color: '#999',
        cursor: 'pointer',
        marginRight: 16,
        padding: '2px 0',
    },
};