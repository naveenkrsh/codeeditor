import React from 'react';
//redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import _ from 'lodash';


import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { Tab } from 'material-ui/Tabs'
import Snackbar from 'material-ui/Snackbar';
import { red500 } from 'material-ui/styles/colors';

import CodeMirror from 'react-codemirror';
import CopyToClipboard from 'react-copy-to-clipboard';

import javascript from 'codemirror/mode/javascript/javascript';
require('codemirror/mode/clike/clike');

//action
import { codeChange } from '../actions/action_fileTree'

//css 
import { } from 'codemirror/theme/duotone-dark.css'
import { } from 'codemirror/theme/yeti.css'

const styles = {
    language: {
        width: 200,
        float: 'right'
    },
    copy: {
        float: 'right'
    },
    clear: {
        color: red500,
        float: 'right'
    }
};
class CodeEditor extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            snackBar: {
                open: false,
                message: '',
                action: '',
                timeout: 4000
            },
            value: this.props.file.code.value,
            //language: this.props.file.code.language
            language: 'javascript',
            theme: 'default'
        };


        //console.log(this.state.file);

        this.updateCode = this.updateCode.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.interact = this.interact.bind(this);

        this.handleClearCode = this.handleClearCode.bind(this);

        this.handleThemeChange = this.handleThemeChange.bind(this);

        this.openSnackBar = this.openSnackBar.bind(this);
        //Snackbar
        this.handleSnackbarTouchTap = this.handleSnackbarTouchTap.bind(this);
        this.handleSnackbarRequestClose = this.handleSnackbarRequestClose.bind(this);

        this.debounceCodeChange = this.debounceCodeChange();
    }

    debounceCodeChange() {
        var _this = this;
        let debounceCodeChange = _.debounce(() => {

            let payload = {};
            payload.file = { ..._this.props.file };
            payload.file.code = { ...payload.file.code, value: _this.state.value }
            payload.folderId = _this.props.parentId;
            _this.props.codeChange(payload)
        }, 2000);

        return debounceCodeChange;
    }
    updateCode(newCode) {
        this.setState((prevState) => {
            return { ...prevState, value: newCode };
        });
        this.debounceCodeChange();

    };
    changeMode(event, index, value) {
        let payload = {};
        payload.file = { ...this.props.file };
        payload.file.code = { ...payload.file.code, language: value }
        payload.folderId = this.props.parentId;
        this.props.codeChange(payload);
        this.setState((prevState) => {
            return { ...prevState, language: value };
        });
    }
    handleClearCode() {

        let payload = {};
        payload.file = { ...this.props.file };
        payload.file.code = { ...payload.file.code, value: '' }
        payload.folderId = this.props.parentId;
        this.props.codeChange(payload);

        this.setState((prevState) => {
            return {
                ...prevState, snackBar: {
                    ...prevState.snackBar,
                    open: true,
                    message: 'Code has been cleared.',
                    timeout: 4000,
                    action: "close"
                },
                value: ''
            };
        });
    }
    interact(cm) {
        console.log(cm.getValue());
    };

    handleThemeChange(event, index, value) {
        this.setState((prevState) => {
            return { ...prevState, theme: value }
        });
    }
    openSnackBar() {
        this.setState((prevState) => {

            return {
                ...prevState, snackBar:
                {
                    ...prevState.snackBar,
                    open: true,
                    message: 'Code has been copied.',
                    timeout: 4000,
                    action: "close"
                }
            };
        });
    }
    //Snackbar methods..
    handleSnackbarTouchTap(type) {

        //TODO: Implement UNDO for type== clear

        // console.log(type);
        this.setState((prevState) => {
            return {
                ...prevState, snackBar:
                {
                    ...prevState.snackBar,
                    open: false
                }
            };
        });
    }

    handleSnackbarRequestClose() {
        this.setState((prevState) => {

            return {
                ...prevState, snackBar:
                {
                    ...prevState.snackBar,
                    open: false
                }
            };
        });
    }




    render() {

        console.log(this.props.readOnly);

        let isReadOnly = this.props.readOnly ? this.props.readOnly : false

        var options = {
            lineNumbers: true,
            readOnly: this.state.readOnly,
            mode: this.state.language,
            theme: this.state.theme,
            readOnly: isReadOnly
        };
        return (
            <div className="row">

                <div className="col-md-12">
                    <CodeMirror ref="editor"
                        value={this.state.value}
                        onChange={this.updateCode}
                        options={options}
                        interact={this.interact}
                        />
                </div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-4">
                            <SelectField
                                floatingLabelText="Language"
                                onChange={this.changeMode}
                                value={this.state.language}
                                disabled={isReadOnly}
                                >
                                <MenuItem value={"markdown"} primaryText="markdown" />
                                <MenuItem value={"javascript"} primaryText="javascript" />
                            </SelectField>
                           </div>
                           <div className="col-md-4">
                            <SelectField
                                floatingLabelText="Theme"
                                onChange={this.handleThemeChange}
                                value={this.state.theme}
                                >
                                <MenuItem value={"default"} primaryText="default" />
                                <MenuItem value={"duotone-dark"} primaryText="duotone-dark" />
                            </SelectField>
                        </div>
                        <div className="col-md-4">
                            <div style={{ display: isReadOnly ? 'none' : 'block' }}>
                                <FlatButton
                                    label="Clear"
                                    style={styles.clear}
                                    onClick={this.handleClearCode}
                                    />
                            </div>
                            <CopyToClipboard text={this.props.file.code.value}
                                onCopy={() => this.openSnackBar()}>
                                <FlatButton
                                    label="Copy"
                                    primary={true}
                                    style={styles.copy}
                                    />
                            </CopyToClipboard>
                        </div>

                    </div>




                </div>

                <Snackbar
                    open={this.state.snackBar.open}
                    message={this.state.snackBar.message}
                    autoHideDuration={this.state.snackBar.timeout}
                    action={this.state.snackBar.action}
                    onActionTouchTap={() => this.handleSnackbarTouchTap(this.state.snackBar.action)}
                    onRequestClose={this.handleSnackbarRequestClose}
                    />

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ codeChange }, dispatch);
}

export default connect(null, mapDispatchToProps)(CodeEditor);