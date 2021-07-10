import React, {useRef, useState} from 'react'
import axios from 'axios'

import './App.css';

function App() {

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

  return (
    <div className="container-lg">
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

    </div>
  );
}

export default App;
