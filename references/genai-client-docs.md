genai.client module
class genai.client.AsyncClient(api_client)
Bases: object

Client for making asynchronous (non-blocking) requests.

async aclose()
Closes the async client explicitly.

However, it doesn’t close the sync client, which can be closed using the Client.close() method or using the context manager.

Usage: .. code-block:: python

from google.genai import Client

async_client = Client(
vertexai=True, project=’my-project-id’, location=’us-central1’

).aio response_1 = await async_client.models.generate_content(

model=’gemini-2.0-flash’, contents=’Hello World’,

) response_2 = await async_client.models.generate_content(

model=’gemini-2.0-flash’, contents=’Hello World’,

) # Close the client to release resources. await async_client.aclose()

Return type:
None

property auth_tokens: AsyncTokens
property batches: AsyncBatches
property caches: AsyncCaches
property chats: AsyncChats
property file_search_stores: AsyncFileSearchStores
property files: AsyncFiles
property interactions: AsyncInteractionsResource
property live: AsyncLive
property models: AsyncModels
property operations: AsyncOperations
property tunings: AsyncTunings
class genai.client.Client(*, vertexai=None, api_key=None, credentials=None, project=None, location=None, debug_config=None, http_options=None)
Bases: object

Client for making synchronous requests.

Use this client to make a request to the Gemini Developer API or Vertex AI API and then wait for the response.

To initialize the client, provide the required arguments either directly or by using environment variables. Gemini API users and Vertex AI users in express mode can provide API key by providing input argument api_key=”your-api-key” or by defining GOOGLE_API_KEY=”your-api-key” as an environment variable

Vertex AI API users can provide inputs argument as vertexai=True, project=”your-project-id”, location=”us-central1” or by defining GOOGLE_GENAI_USE_VERTEXAI=true, GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION environment variables.

api_key
The API key to use for authentication. Applies to the Gemini Developer API only.

vertexai
Indicates whether the client should use the Vertex AI API endpoints. Defaults to False (uses Gemini Developer API endpoints). Applies to the Vertex AI API only.

credentials
The credentials to use for authentication when calling the Vertex AI APIs. Credentials can be obtained from environment variables and default credentials. For more information, see Set up Application Default Credentials. Applies to the Vertex AI API only.

project
The Google Cloud project ID to use for quota. Can be obtained from environment variables (for example, GOOGLE_CLOUD_PROJECT). Applies to the Vertex AI API only. Find your Google Cloud project ID.

location
The location to send API requests to (for example, us-central1). Can be obtained from environment variables. Applies to the Vertex AI API only.

debug_config
Config settings that control network behavior of the client. This is typically used when running test code.

http_options
Http options to use for the client. These options will be applied to all requests made by the client. Example usage: client = genai.Client(http_options=types.HttpOptions(api_version=’v1’)).

Usage for the Gemini Developer API:

from google import genai

client = genai.Client(api_key='my-api-key')
Usage for the Vertex AI API:

from google import genai

client = genai.Client(
    vertexai=True, project='my-project-id', location='us-central1'
)
Initializes the client.

Parameters:
vertexai (bool) – Indicates whether the client should use the Vertex AI API endpoints. Defaults to False (uses Gemini Developer API endpoints). Applies to the Vertex AI API only.

api_key (str) –

The API key to use for authentication. Applies to the Gemini Developer API only.

credentials (google.auth.credentials.Credentials) –

The credentials to use for authentication when calling the Vertex AI APIs. Credentials can be obtained from environment variables and default credentials. For more information, see Set up Application Default Credentials. Applies to the Vertex AI API only.

project (str) –

The Google Cloud project ID to use for quota. Can be obtained from environment variables (for example, GOOGLE_CLOUD_PROJECT). Applies to the Vertex AI API only.

location (str) –

The location to send API requests to (for example, us-central1). Can be obtained from environment variables. Applies to the Vertex AI API only.

debug_config (DebugConfig) – Config settings that control network behavior of the client. This is typically used when running test code.

http_options (Union[HttpOptions, HttpOptionsDict]) – Http options to use for the client.

property aio: AsyncClient
property auth_tokens: Tokens
property batches: Batches
property caches: Caches
property chats: Chats
close()
Closes the synchronous client explicitly.

However, it doesn’t close the async client, which can be closed using the Client.aio.aclose() method or using the async context manager.

Usage: .. code-block:: python

from google.genai import Client

client = Client(
vertexai=True, project=’my-project-id’, location=’us-central1’

) response_1 = client.models.generate_content(

model=’gemini-2.0-flash’, contents=’Hello World’,

) response_2 = client.models.generate_content(

model=’gemini-2.0-flash’, contents=’Hello World’,

) # Close the client to release resources. client.close()

Return type:
None

property file_search_stores: FileSearchStores
property files: Files
property interactions: InteractionsResource
property models: Models
property operations: Operations
property tunings: Tunings
property vertexai: bool
Returns whether the client is using the Vertex AI API.

pydantic model genai.client.DebugConfig
Bases: BaseModel

Configuration options that change client network behavior when testing.

Create a new model by parsing and validating input data from keyword arguments.

Raises [ValidationError][pydantic_core.ValidationError] if the input data cannot be validated to form a valid model.

self is explicitly positional-only to allow self as a field name.

Show JSON schema
Fields:
client_mode (str | None)

replay_id (str | None)

replays_directory (str | None)

field client_mode: Optional[str] [Optional]
field replay_id: Optional[str] [Optional]
field replays_directory: Optional[str] [Optional]