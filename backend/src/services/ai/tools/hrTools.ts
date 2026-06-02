export const hrTools = [
  {
    type: "function",
    function: {
      name: "rejectCandidate",
      description: "Rejects a candidate for a specific job application. Use this when the HR manager decides a candidate is not a good fit.",
      parameters: {
        type: "object",
        properties: {
          applicationId: {
            type: "string",
            description: "The unique UUID of the candidate's application."
          },
          reason: {
            type: "string",
            description: "The reason for rejecting the candidate. This will be saved in the system."
          }
        },
        required: ["applicationId", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "shortlistCandidate",
      description: "Shortlists a candidate for a specific job application. Use this when the HR manager wants to move a candidate forward.",
      parameters: {
        type: "object",
        properties: {
          applicationId: {
            type: "string",
            description: "The unique UUID of the candidate's application."
          },
          reason: {
            type: "string",
            description: "Optional reasoning for shortlisting the candidate."
          }
        },
        required: ["applicationId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createJob",
      description: "Creates a new job posting on the OptioHire platform.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the job posting (e.g. Senior Software Engineer)."
          },
          department: {
            type: "string",
            description: "The department the job belongs to."
          },
          location: {
            type: "string",
            description: "The location of the job (e.g. New York, Remote)."
          },
          description: {
            type: "string",
            description: "A brief description or requirements for the job."
          }
        },
        required: ["title", "department", "location"]
      }
    }
  }
];
