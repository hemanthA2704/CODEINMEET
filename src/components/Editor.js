import React, { useEffect, useState, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-mirage.css';
import 'codemirror/theme/3024-day.css';
import 'codemirror/theme/blackboard.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/theme/hopscotch.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/go/go';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/r/r';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, changeCode, changeLang }) => {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState('text/x-c++src');
  const [theme , setTheme] = useState('hopscotch') ;
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    changeLang(newLanguage);
    socketRef.current.emit(ACTIONS.LANG_CHANGE, { language: newLanguage, roomId });
  };

  const handleThemeChange = (event) => {
    const newTheme = event.target.value ;
    setTheme(newTheme);
  }

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = CodeMirror.fromTextArea(document.getElementById('editorArea'), {
        mode: { name: language, json: true },
        theme: theme,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        indentUnit: 4, // Set indent size to 4 spaces
        tabSize: 4,
      });

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
        changeCode(code);
      });
    } else {
      editorRef.current.setOption('theme', theme);
    }
  }, [theme]);
  

  useEffect(() => {
    if (editorRef.current) {
      // here this function will be called first then component will be rendered , 
      // so by the time this useEffect runs language will be set to None initially.thats why we have to check .
      editorRef.current.setOption('mode', {name : language || 'text/x-c++src', json : true});
    }
  }, [language]);

  // language
  useEffect(() => {
    if (socketRef.current) {
      const handleCodeChange = ({ code }) => {
        if (code !== null && code !== editorRef.current.getValue()) {
          editorRef.current.setValue(code);
        }
      };

      const handleLangChange = ({ language }) => {
        setLanguage(language);
        changeLang(language);
      };

      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      socketRef.current.on(ACTIONS.LANG_CHANGE, handleLangChange);

      // Cleanup listeners on unmount or dependency change
      return () => {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        socketRef.current.off(ACTIONS.LANG_CHANGE, handleLangChange);
      };
    }
  }, [socketRef.current ]);

  return (
    <div>
      <div className='headerTab'>
        <select className='selectLanguage' onChange={handleLanguageChange} value={language || 'text/x-c++src' }>
          <option value="text/x-c++src">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="text/x-java">Java</option>
          <option value="go">Golang</option>
          <option value="ruby">Ruby</option>
          <option value="r">R</option>
        </select>
        
        <label className='theme'>
          Theme : &nbsp;
          <select className='selectTheme' onChange={handleThemeChange} value={theme || 'hopscotch'}>
          <option value='hopscotch'>Hopscotch</option>
          <option value='ayu-mirage'>Ayu-mirage</option>
          <option value='3024-day'>Light</option>
          <option value='blackboard'>Blackboard</option>
          <option value='darcula'>Darcula</option>
          </select>
        </label>
      </div>
      <textarea id="editorArea"></textarea>
    </div>
  );
};

export default Editor;
