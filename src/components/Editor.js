import React, { useEffect, useState, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-mirage.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/go/go';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/r/r';
import ACTIONS from '../Actions';
// mbo,rubyblue,shadowfox,vibrant-ink
const Editor = ({socketRef ,roomId , changeCode}) => {
  const editorRef = useRef(null) ;
  const [language , setLanguage] = useState('javascript') ;
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
};

  useEffect(() => {
    // console.log(language)
    // Check if CodeMirror instance already exists to prevent creating multiple instances
    if (document.querySelector('.CodeMirror')) {
      return;
    }

      editorRef.current = CodeMirror.fromTextArea(document.getElementById('editorArea'), {
      mode: { name: language , json: true },
      theme: 'ayu-mirage',
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      indentUnit: 4, // Set indent size to 4 spaces
      tabSize: 4  
    });
    editorRef.current.on('change',(instance , changes) =>{
      // console.log('changes',changes);
      const {origin} = changes ;
      const code = instance.getValue();
      if (origin!== 'setValue') {
        socketRef.current.emit(ACTIONS.CODE_CHANGE,{
          roomId ,
          code
        })
      }
      console.log(code);
      changeCode(code);
    })

    // Optionally, clean up the CodeMirror instance on unmount
    // return () => {
    //   if (editor) {
    //     editor.toTextArea();
    //   }
    // };
  }, []);


  useEffect(()=> {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE , ({code}) => {
        if (code!==null) {
          editorRef.current.setValue(code) ;
        }
        // this cleanup function will be called after if this component is
        // about to be deleted , and when dependency changes happens
        return () => {
          socketRef.current.off(ACTIONS.CODE_CHANGE) ;
        }
      });
    }
  } ,[socketRef.current])
  return (
    <div>
      <div className='headerTab'>
        <select className='selectLanguage' onChange={handleLanguageChange} value={language}>
          <option value="text/x-c++src">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="text/x-java">Java</option>
          <option value="go">Golang</option>
          <option value="ruby">Ruby</option>
          <option value="r">R</option>
        </select>
      </div>
      <textarea id="editorArea"></textarea>
    </div>
  );
};

export default Editor;
