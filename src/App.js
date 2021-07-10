import React, {useRef, useState} from 'react'
import axios from 'axios'

import Editor from './components/Editor';
import SelectOption from './components/SelectOption';

import { fontSizes, languageToEditorMode, themes } from './config/EditorOptions'

import './App.css';

function App() {
  const languages = Object.keys(languageToEditorMode)

  const [language, setLanguage] = useState('c');
  const [theme, setTheme] = useState(themes[0])
  const [fontSize, setFontSize] = useState('16')
  const [body, setBody] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const fileInput = useRef(null);

  const visionAPI = () => {
    const fileName = fileInput.current.files[0]
    if (!fileName) alert("please select image")
    const data = new FormData()
    data.append('file', fileName)
    axios.post('http://localhost:5000/upload', data, {})
      .then(res => {
        console.log(res.data.text)
        // setBody(res.data.text)
      })
  }

  const handleFileChange = (e) => {
    console.log(e.target.value)
  }
  const handleUpdateBody = (value) => {
    setBody(value);
    console.log(value)
  };

  const handleUpdateInput = (value) => {
    setInput(value);
  };


  return (
    <div className="container-lg">
      <div className="mb-2">
                    <SelectOption
                      label="Language"
                      defaultValue={language}
                      setValue={(val)=>setLanguage(val)}
                      values={languages}
                    />
                  </div>

                  <div className="mb-2">
                    <SelectOption
                      label="Theme"
                      defaultValue={theme}
                      setValue={setTheme}
                      values={themes}
                    />

                  </div>
                  <div className="mb-2">
                    <SelectOption
                      label="Font Size"
                      defaultValue={fontSize}
                      setValue={setFontSize}
                      values={fontSizes}
                    />
                  </div>

      <div className="d-flex align-items-center justify-content-center mb-2" >
        <label for="file-upload" class="custom-file-upload btn-outline-success">
          <i class="fa fa-cloud-upload"></i> Upload Image
        </label>

        <input
          id="file-upload"

          type="file"
          onChange={handleFileChange}
          ref={fileInput}

        />

        <button class="btn btn-outline-success mx-3" onClick={visionAPI} >Get Code</button>

      </div>
      <div>
      <div className="row" >
                    <div className="col-lg-6 col-sm-12 mb-2 mx-0 pe-0" >
                      <p>EDITOR</p>
                      

                      <Editor

                        language={languageToEditorMode[language]}
                        theme={theme}
                        body={body}
                        handleBodyChange={(val) => handleUpdateBody(val)}
                        readOnly={false}
                        fontSize={fontSize}
                        width="100%"
                      />
                       <div className="d-flex justify-content-between my-2">
                      <button class="btn btn-outline-success"  >Submit</button> 
                      {/* onClick={handleSubmit}
                      onClick={handleDownload} */}
                      <button class="btn btn-outline-success"  >Download</button>
                    </div>
                    </div>

                    <div className="col-lg-6 col-sm-12" >
                      <p>INPUT</p>
                      <Editor
                        language=''
                        theme={theme}
                        body={input}
                        handleBodyChange={handleUpdateInput}
                        readOnly={false}
                        fontSize={fontSize}
                        height='150px'

                      />

                    </div>
                    <div className="col-sm-12" >
                      <p>OUTPUT</p>
                      <Editor
                        language=""
                        theme={theme}
                        body={output}
                        handleBodyChange={setOutput}
                        readOnly={true}
                        fontSize={fontSize}
                        height='250px'

                      />
                    </div>
                  </div>
                </div>

    </div>
  );
}

export default App;
