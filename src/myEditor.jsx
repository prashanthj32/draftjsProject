import React, { useState } from 'react';
import { Editor, EditorState, Modifier, RichUtils, convertToRaw, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css'
import { stateToHTML } from 'draft-js-export-html';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
        const contentState = editorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        console.log(rawContentState, contentState);

        const html = stateToHTML(contentState);
        setHtmlData(html);
        console.log('Captured Data (HTML):', html);
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
        console.log(inlineStyle, editorState);
        setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    };

    // Custom overrides for "code" style.
    const styleMap = {
        CODE: {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
            fontSize: 16,
            padding: 2,
        },
    };

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
                    editor={ClassicEditor}
                    data={htmlData}
                    onInit={(editor) => {
                        // You can listen to the editor initialization here
                        console.log('Editor is ready to use!', editor);
                    }}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        console.log({ event, editor, data });
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