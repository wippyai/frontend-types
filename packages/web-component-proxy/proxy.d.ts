declare module '@wippy/proxy' {
        import * as nanoevents from 'nanoevents';
import { ConfirmationOptions } from 'primevue/confirmationoptions';
import * as primevue_toast from 'primevue/toast';
import * as axios from 'axios';
import { AxiosDefaults } from 'axios';
import { addCollection } from '@iconify/vue';

declare namespace PageApi {
    interface Page {
        icon: string;
        id: string;
        name: string;
        title: string;
        internal?: string;
        order: number;
        placement?: 'default' | 'bottom';
        hidden?: boolean;
        badge?: string | number;
        badge_icon?: string;
        group?: string;
        group_order?: number;
        group_icon?: string;
        group_placement?: 'default' | 'bottom';
        content_version?: string;
    }
    interface PagesResponse {
        count: number;
        pages: Page[];
        success: boolean;
    }
    interface PageContentResponse {
        content: string;
        success: boolean;
    }
}

declare namespace UploadApi {
    interface Meta {
        filename: string;
        content_sample?: string;
    }
    interface Upload {
        uuid: string;
        created_at: string;
        updated_at: string;
        mime_type: string;
        size: number;
        /**
         * Note `@@local` is not part of the API response, it's a local state when file is still only on user PC
         */
        status: '@@local' | 'uploaded' | 'completed' | 'error' | 'processing';
        meta: Meta;
        error?: string;
    }
    interface ListResponse {
        success: boolean;
        meta: {
            limit: number;
            offset: number;
            total: number;
        };
        uploads: Upload[];
    }
    interface GetResponse {
        success: boolean;
        upload: Upload;
    }
    interface UploadResponse {
        success: boolean;
        uuid: string;
    }
}

declare enum ArtifactStatus {
    /**
     * The artifact is still being generated or processed.
     * UI should display a loading indicator or show partial code/content.
     * User interactions with the artifact may be limited during this state.
     */
    PROCESSING = "processing",
    /**
     * The artifact rendering is complete and it's in an active state.
     * For interactive artifacts (forms, calculators, etc.), this indicates
     * the artifact is ready and waiting for user input or interaction.
     * UI should show the artifact as fully interactive.
     */
    RUNNING = "running",
    /**
     * The artifact rendering is complete but it's in an inactive state.
     * For interactive artifacts, this indicates the artifact is not expecting
     * any further input from the user.
     * UI should show the artifact as read-only or with limited interactivity.
     */
    IDLE = "idle"
}
declare enum ArtifactType {
    /**
     * The artifact is embedded within chat message, html is sanitized to very basic tags.
     */
    INLINE = "inline",
    /**
     * The artifact is embedded within chat message, in an iframe with support of iframe-proxy API
     */
    INLINE_INTERACTIVE = "inline-interactive",
    /**
     * The artifact is rendered as a button that opens artifact in an iframe with support of iframe-proxy API
     * @see iframe-proxy.md
     */
    STANDALONE = "standalone"
}
interface Artifact {
    uuid: string;
    title: string;
    description?: string;
    icon?: string;
    type: ArtifactType;
    content_type: 'text/html' | 'text/markdown';
    content_version?: string;
    status: ArtifactStatus;
}

type ArtifactUUID = string;
type PageUUID = string;
type SessionUUID = string;
type EntryUUID = string;
type MessageUUID = string;
type ActionCommand = 'navigate' | 'sidebar';
declare const WsTopicPrefixes: {
    readonly Pages: "pages";
    readonly Page: "page";
    readonly Artifact: "artifact";
    readonly Welcome: "welcome";
    readonly Update: "update";
    readonly Session: "session";
    readonly SessionOpen: "session.opened";
    readonly SessionClosed: "session.closed";
    readonly Error: "error";
    readonly Upload: "upload";
    readonly Action: "action";
    readonly Registry: "registry";
    readonly RegistryEntry: "entry";
};
interface WsTopicTypes {
    /**
     * Welcome info with active sessions
     */
    Welcome: typeof WsTopicPrefixes.Welcome;
    /**
     * Artifact are updated
     */
    Artifact: `${typeof WsTopicPrefixes.Artifact}:${ArtifactUUID}`;
    /**
     * Dynamic page list is updated
     */
    Pages: typeof WsTopicPrefixes.Pages;
    /**
     * Single page is updated and needs reload
     */
    Page: `${typeof WsTopicPrefixes.Page}:${PageUUID}`;
    /**
     * Session was opened event
     */
    SessionOpened: typeof WsTopicPrefixes.SessionOpen;
    /**
     * Session was closed event
     */
    SessionClosed: typeof WsTopicPrefixes.SessionClosed;
    /**
     * Session operation
     */
    Session: `${typeof WsTopicPrefixes.Session}:${SessionUUID}`;
    /**
     * Registry operation
     */
    Registry: `${typeof WsTopicPrefixes.Registry}:${string}`;
    /**
     * Registry entry updates
     */
    RegistryEntry: `${typeof WsTopicPrefixes.RegistryEntry}:${EntryUUID}`;
    /**
     * Registry entry updates
     */
    Action: `${typeof WsTopicPrefixes.Action}:${ActionCommand}`;
    /**
     * Session message
     */
    SessionMessage: `${typeof WsTopicPrefixes.Session}:${SessionUUID}:message:${MessageUUID}`;
    /**
     * Error message
     */
    Error: typeof WsTopicPrefixes.Error;
    /**
     * Upload was created or updated
     */
    Upload: `${typeof WsTopicPrefixes.Upload}:${string}`;
}
type WsTopic = WsTopicTypes[keyof WsTopicTypes];
declare enum WsMessageType {
    /** Contains the actual content of the message */
    CONTENT = "content",
    /** Contains content of the message to append to current one */
    CHUNK = "chunk",
    /** User message with contents */
    USER = "received",
    /** Response started, can create a message placeholder */
    RESPONSE_STARTED = "response_started",
    /** Kill the message */
    INVALIDATE = "invalidate",
    /** from to agent, get agent names */
    DELEGATION = "delegation",
    /** Tool/fn was called */
    TOOL_CALL = "tool_call",
    FUNCTION_CALL = "function_call",
    /** Tool/fn was succesfull */
    TOOL_SUCCESS = "tool_success",
    FUNCTION_SUCCESS = "function_success",
    /** Tool/fn failed */
    TOOL_ERROR = "tool_error",
    FUNCTION_ERROR = "function_error",
    /** Error */
    ERROR = "error",
    /** Error */
    ARTIFACT = "artifact"
}
interface WsMessageBase {
    topic: WsTopic;
    data?: {
        request_id?: string;
    };
}
interface WsMessage_Welcome extends WsMessageBase {
    topic: WsTopicTypes['Welcome'];
    data: {
        request_id?: string;
        active_session_ids: Array<string>;
        active_sessions: number;
        client_count: number;
        user_id: string;
    };
}
interface WsMessage_Action extends WsMessageBase {
    topic: WsTopicTypes['Action'];
    data: {
        request_id?: string;
        artifact_uuid?: string;
        artifact_content_type?: string;
        session_uuid?: string;
        path?: string;
    };
}
interface WsMessage_Registry extends WsMessageBase {
    topic: WsTopicTypes['Registry'];
    data: {
        request_id?: string;
    };
}
interface WsMessage_RegistryEntry extends WsMessageBase {
    topic: WsTopicTypes['RegistryEntry'];
    data: {
        request_id?: string;
        content_version?: string;
    };
}
interface WsMessage_Pages extends WsMessageBase {
    topic: WsTopicTypes['Pages'];
}
interface WsMessage_Page extends WsMessageBase {
    topic: WsTopicTypes['Page'];
    data: PageApi.Page & {
        request_id?: string;
    };
}
interface WsMessage_SessionOpen extends WsMessageBase {
    topic: WsTopicTypes['SessionOpened'];
    data: {
        request_id?: string;
        active_session_ids: Array<string>;
        session_id: string;
    };
}
interface WsMessage_Error extends WsMessageBase {
    topic: WsTopicTypes['Error'];
    data: {
        request_id?: string;
        error: string;
        message: string;
    };
}
interface WsMessage_SessionClosed extends WsMessageBase {
    topic: WsTopicTypes['SessionClosed'];
    data: {
        request_id?: string;
        active_session_ids: Array<string>;
        session_id: string;
    };
}
interface WsMessageDataBase {
    type: WsMessageType;
}
interface WsMessageDataChunk extends WsMessageDataBase {
    type: WsMessageType.CHUNK;
    content: string;
}
interface WsMessageDataContent extends WsMessageDataBase {
    type: WsMessageType.CONTENT;
    content: string;
    message_id: MessageUUID;
    file_uuids?: string[];
}
interface WsMessageDataUser extends WsMessageDataBase {
    type: WsMessageType.USER;
    text: string;
    message_id: MessageUUID;
    file_uuids?: string[];
}
interface WsMessageDataDelegation extends WsMessageDataBase {
    type: WsMessageType.DELEGATION;
    from: string;
    to: string;
}
interface WsMessageDataInvalidate extends WsMessageDataBase {
    type: WsMessageType.INVALIDATE;
}
interface WsMessageDataStarted extends WsMessageDataBase {
    type: WsMessageType.RESPONSE_STARTED;
    message_id: MessageUUID;
}
interface WsMessageDataToolCall extends WsMessageDataBase {
    type: WsMessageType.TOOL_CALL | WsMessageType.FUNCTION_CALL;
    function_name: string;
    artifact_id?: string;
}
interface WsMessageDataArtifact extends WsMessageDataBase {
    type: WsMessageType.ARTIFACT;
    artifact_id?: string;
}
interface WsMessageDataToolSuccess extends WsMessageDataBase {
    type: WsMessageType.TOOL_SUCCESS | WsMessageType.FUNCTION_SUCCESS;
    function_name: string;
    artifact_id?: string;
}
interface WsMessageDataToolError extends WsMessageDataBase {
    type: WsMessageType.TOOL_ERROR | WsMessageType.FUNCTION_ERROR;
    function_name: string;
    artifact_id?: string;
}
interface WsMessageDataError extends WsMessageDataBase {
    type: WsMessageType.ERROR;
    message: string;
    code: string;
}
interface WsMessage_SessionMessage extends WsMessageBase {
    topic: WsTopicTypes['SessionMessage'];
    data: (WsMessageDataUser | WsMessageDataContent | WsMessageDataChunk | WsMessageDataDelegation | WsMessageDataToolCall | WsMessageDataError | WsMessageDataInvalidate | WsMessageDataStarted | WsMessageDataToolSuccess | WsMessageDataArtifact | WsMessageDataToolError) & {
        request_id?: string;
    };
}
interface WsMessage_Session extends WsMessageBase {
    topic: WsTopicTypes['Session'];
    data: {
        request_id?: string;
        agent?: string;
        last_message_date?: number;
        model?: string;
        status?: string;
        title?: string;
        type: 'update';
        public_meta?: Array<{
            icon?: string;
            id: string;
            title: string;
            url?: string;
        }>;
    };
}
interface WsMessage_Artifact extends WsMessageBase {
    topic: WsTopicTypes['Artifact'];
    data: Partial<Artifact> & {
        request_id?: string;
    };
}
interface WsMessage_Upload extends WsMessageBase {
    topic: WsTopicTypes['Upload'];
    data: UploadApi.Upload & {
        request_id?: string;
    };
}
type WsMessage = WsMessage_Welcome | WsMessage_Pages | WsMessage_Page | WsMessage_SessionMessage | WsMessage_Session | WsMessage_SessionClosed | WsMessage_Error | WsMessage_Artifact | WsMessage_SessionOpen | WsMessage_Action | WsMessage_Registry | WsMessage_RegistryEntry | WsMessage_Upload;

type KnownTopics = '@history' | '@message';
type Events = {
    /** Emitted when pages are updated */
    '@history': (data: {
        path: string;
    }) => void;
    '@message': (data: WsMessage) => void;
} & {
    [K in string as K extends KnownTopics ? never : K]: (data: WsMessage) => void;
};

var cssRS = {
	
};

var session = {
	type: "non-persistent"
};
var history = "browser";
var env = {
	APP_API_URL: "",
	APP_AUTH_API_URL: "",
	APP_WEBSOCKET_URL: ""
};
var featureRS = {
	session: session,
	history: history,
	env: env
};

var customPage = {
	loading: {
		title: "Loading page content..."
	},
	error: {
		title: "Failed to load page content"
	}
};
var home = {
	loading: "Application is Loading",
	error: {
		title: "Error Loading Application"
	},
	noHomePage: {
		title: "No Home Page Detected",
		message: "Probably backend configuration is malformed"
	}
};
var app = {
	title: "Wippy App",
	appName: "Wippy",
	icon: "wippy:logo"
};
var login = {
	error: {
		title: "Session Token Expired",
		message: "Try Launching Application Again"
	}
};
var keeper = {
	controls: {
		newChat: "New Chat",
		searchAgents: "Search agents...",
		undo: "Undo",
		redo: "Redo",
		download: "Registry To File System",
		upload: "File System To Registry",
		codeAssistant: "Wippy Code Assistant",
		syncControls: "Sync Controls",
		confirmUpload: {
			title: "Confirm Upload",
			message: "Do you wish to upload file system changes to registry? This will overwrite current state",
			cancel: "Cancel",
			upload: "Upload",
			cancelled: {
				title: "Upload cancelled",
				message: "The upload operation was cancelled"
			}
		}
	},
	version: {
		label: "Version:",
		tooltip: "Version {{version}}"
	}
};
var textRS = {
	customPage: customPage,
	home: home,
	app: app,
	login: login,
	keeper: keeper
};

type I18NFeatureTypes = typeof featureRS;
type I18NTextTypes = typeof textRS;
type I18NCssTypes = typeof cssRS;

interface AppFeatures extends I18NFeatureTypes {
    /**
     * If to remember auth details or not
     */
    session: {
        type: 'non-persistent' | 'cookie';
    };
    history: 'browser' | 'hash';
    env: {
        APP_API_URL: string;
        APP_AUTH_API_URL: string;
        APP_WEBSOCKET_URL: string;
    };
    axiosDefaults?: Partial<AxiosDefaults>;
    routePrefix?: string;
    showAdmin?: boolean;
    allowSelectModel?: boolean;
    startNavOpen?: boolean;
    hideNavBar?: boolean;
}
interface AppAuthConfig {
    token: string;
    expiresAt: string;
}
interface AppCustomization {
    customCSS?: string;
    cssVariables?: I18NCssTypes;
    i18n?: Partial<I18NTextTypes>;
    icons?: Record<string, {
        body: string;
        width: number;
        height: number;
    }>;
}
interface AppConfig {
    artifactId?: string;
    /**
     * Starting app or artifact/page path
     */
    path?: string;
    /**
     * App features like history mode, session type, etc.
     */
    feature?: AppFeatures;
    /**
     * Auth configuration
     */
    auth: AppAuthConfig;
    /**
     * App customization like i18n texts, css variables, custom css, etc.
     */
    customization?: AppCustomization;
}

interface FormState {
    data?: Record<string, unknown>;
    status: 'active' | 'inactive';
}
interface FormResult {
    success: boolean;
    message?: string;
    errors?: Record<string, string>;
}
type LimitedConfirmationOptions = Omit<ConfirmationOptions, 'target' | 'appendTo' | 'onShow' | 'onHide'>;

declare const fontCssUrl: string;
declare const iframeCssUrl: string;
declare const markdownCssUrl: string;
declare const primeVueCssUrl: string;
declare const themeConfigUrl: string;

declare const hostCssRaw_fontCssUrl: typeof fontCssUrl;
declare const hostCssRaw_iframeCssUrl: typeof iframeCssUrl;
declare const hostCssRaw_markdownCssUrl: typeof markdownCssUrl;
declare const hostCssRaw_primeVueCssUrl: typeof primeVueCssUrl;
declare const hostCssRaw_themeConfigUrl: typeof themeConfigUrl;
declare namespace hostCssRaw {
  export { hostCssRaw_fontCssUrl as fontCssUrl, hostCssRaw_iframeCssUrl as iframeCssUrl, hostCssRaw_markdownCssUrl as markdownCssUrl, hostCssRaw_primeVueCssUrl as primeVueCssUrl, hostCssRaw_themeConfigUrl as themeConfigUrl };
}

declare const resolvers: {
    readonly api: axios.AxiosInstance;
    readonly host: {
        toast: (message: primevue_toast.ToastMessageOptions) => void;
        confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
        startChat: (start_token: string, options?: {
            sidebar?: boolean;
        }) => void;
        openSession: (sessionUUID: string, options?: {
            sidebar?: boolean;
        }) => void;
        openArtifact: (artifactUUID: string, options?: {
            target: "modal" | "sidebar";
        }) => void;
        navigate: (url: string) => void;
        handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
        setContext: (context: Record<string, unknown>, sessionUUID?: string, source?: {
            type: "page" | "artifact";
            uuid: string;
            instanceUUID?: string;
        }) => void;
        formatUrl: (relativeUrl: string) => string;
    };
    readonly iframe: {
        toast: (message: primevue_toast.ToastMessageOptions) => void;
        confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
        startChat: (start_token: string, sidebar?: boolean) => void;
        openSession: (sessionUUID: string, sidebar?: boolean) => void;
        openArtifact: (artifactUUID: string, target: "modal" | "sidebar") => void;
        navigate: (url: string) => void;
        handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
        setContext: (context: Record<string, unknown>, source?: {
            type: "page" | "artifact";
            uuid: string;
        }) => void;
        formatUrl: (relativeUrl: string) => string;
    };
    readonly on: <T extends string>(topicPattern: T, callback: T extends "@history" ? Events["@history"] : Events["@message"]) => nanoevents.Unsubscribe;
    readonly config: AppConfig;
    readonly form: {
        get: () => Promise<FormState>;
        submit: (data: FormData | Record<string, unknown>) => Promise<FormResult>;
    };
    hostCss: typeof hostCssRaw;
    tailwindConfig: {
        content: string[];
        theme: {
            extend: {
                colors: {
                    secondary: {
                        50: string;
                        100: string;
                        200: string;
                        300: string;
                        400: string;
                        500: string;
                        600: string;
                        700: string;
                        800: string;
                        900: string;
                        950: string;
                    };
                };
            };
        };
        plugins: any[];
    };
    /**
     * Automatically defines a web component based on the import meta URL if imported with `declare-tag` in the query parameters.
     * @param importMetaUrl
     * @param ComponentClass
     */
    define: (importMetaUrl: string, ComponentClass: typeof HTMLElement) => void;
    loadCss: (cssUrl: string) => Promise<string>;
    addIcons: (addCollectionFn: typeof addCollection) => void;
};
declare const define: (importMetaUrl: string, ComponentClass: typeof HTMLElement) => void;
declare const api: axios.AxiosInstance;
declare const host: {
    toast: (message: primevue_toast.ToastMessageOptions) => void;
    confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
    startChat: (start_token: string, options?: {
        sidebar?: boolean;
    }) => void;
    openSession: (sessionUUID: string, options?: {
        sidebar?: boolean;
    }) => void;
    openArtifact: (artifactUUID: string, options?: {
        target: "modal" | "sidebar";
    }) => void;
    navigate: (url: string) => void;
    handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
    setContext: (context: Record<string, unknown>, sessionUUID?: string, source?: {
        type: "page" | "artifact";
        uuid: string;
        instanceUUID?: string;
    }) => void;
    formatUrl: (relativeUrl: string) => string;
};
declare const iframe: {
    toast: (message: primevue_toast.ToastMessageOptions) => void;
    confirm: (options: LimitedConfirmationOptions) => Promise<boolean>;
    startChat: (start_token: string, sidebar?: boolean) => void;
    openSession: (sessionUUID: string, sidebar?: boolean) => void;
    openArtifact: (artifactUUID: string, target: "modal" | "sidebar") => void;
    navigate: (url: string) => void;
    handleError: (code: ("auth-expired" | "other"), error: Record<string, unknown>) => void;
    setContext: (context: Record<string, unknown>, source?: {
        type: "page" | "artifact";
        uuid: string;
    }) => void;
    formatUrl: (relativeUrl: string) => string;
};
declare const on: <T extends string>(topicPattern: T, callback: T extends "@history" ? Events["@history"] : Events["@message"]) => nanoevents.Unsubscribe;
declare const config: AppConfig;
declare const form: {
    get: () => Promise<FormState>;
    submit: (data: FormData | Record<string, unknown>) => Promise<FormResult>;
};
declare const hostCss: typeof hostCssRaw;
declare const loadCss: (cssUrl: string) => Promise<string>;
declare const tailwindConfig: {
    content: string[];
    theme: {
        extend: {
            colors: {
                secondary: {
                    50: string;
                    100: string;
                    200: string;
                    300: string;
                    400: string;
                    500: string;
                    600: string;
                    700: string;
                    800: string;
                    900: string;
                    950: string;
                };
            };
        };
    };
    plugins: any[];
};
declare const addIcons: (addCollectionFn: typeof addCollection) => void;

export { addIcons, api, config, resolvers as default, define, form, host, hostCss, iframe, loadCss, on, tailwindConfig };

    }
