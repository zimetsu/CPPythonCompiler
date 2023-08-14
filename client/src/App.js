import './App.css';
import axios from 'axios';
import React, { useState, useEffect} from 'react';
import './styles.css';
import stubs from './defaultStubs';
function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");

  useEffect(() => {
    setCode(stubs[language])
  }, [language]);

  const handleSubmit = async () => {
    const payload = {
      language,
      code,
    };

    try {
      setJobId("");
      setStatus("");
      setOutput("");
      const { data } = await axios.post("http://localhost:5000/run", payload);
      setJobId(data.jobId);
      let intervalId;

      intervalId = setInterval(async () => {
        try {
          const { data: dataRes } = await axios.get(
            "http://localhost:5000/status",
            { params: { id: data.jobId } }
          );

          const { success, job, error } = dataRes;

          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            if (jobStatus === "pending") return;
            setOutput(jobOutput);
            clearInterval(intervalId);
          } else {
            setStatus("Error: Please retry");
            console.error(error);
            clearInterval(intervalId);
            setOutput(error?.stderr || "An unknown error occurred.");
          }
        } catch (error) {
          console.error(error);
        }
      }, 1000);
    } catch (error) {
      if (error.response) {
        const errMsg = error.response.data?.err?.stderr || "Unknown error occurred.";
        setOutput(errMsg);
      } else {
        setOutput("Error connecting to server!");
      }
    }
  };
  return (
    <div className="container">
      
      <h1 className="heading">Online Code Compiler</h1>
      <div>
        <label>Language: </label>
        <select
          value = {language}
          onChange={(e) => {
            let response = window.confirm(
              "WARNING: Switching the language will remove your data"
            )
            if(response){
              setLanguage(e.target.value);
            }
          }}
        >
          <option value = "cpp">C++</option>
          <option value = "py">Python</option>
        </select>
      </div>
      <br>
      </br>
      <textarea
        className="textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={20}
        cols={75}
      ></textarea>
      <br />
      <button className="button" onClick={handleSubmit}>
        Submit
      </button>
      <p>{status}</p>
      <p>{jobId && 'JobId: ' + jobId}</p>
      <p className="output">{output}</p>
    </div>
  );
}

export default App;
