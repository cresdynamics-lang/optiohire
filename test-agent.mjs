async function testAgent() {
  console.log('Sending request to HR Agent at http://67.205.164.114...');
  
  const payload = {
    question: "I need to reject candidate 12345 because they don't meet minimum requirements.",
    context: { url: "https://optiohire.com/dashboard/candidate" }
  };

  try {
    const response = await fetch('http://67.205.164.114/api/hr/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'optiohire.com' // Pretend we are the domain so Nginx serves the right site
      },
      body: JSON.stringify(payload)
    });

    console.log('Status Code:', response.status);
    
    if (!response.ok) {
        console.log('Response Error Text:', await response.text());
        return;
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        process.stdout.write(decoder.decode(value));
    }
    
    console.log('\n\nDone.');
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testAgent();
