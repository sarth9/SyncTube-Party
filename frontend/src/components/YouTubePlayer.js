import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
let youtubeApiPromise = null;
function loadYouTubeIframeApi() {
    if (window.YT?.Player) {
        return Promise.resolve();
    }
    if (youtubeApiPromise) {
        return youtubeApiPromise;
    }
    youtubeApiPromise = new Promise((resolve) => {
        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        window.onYouTubeIframeAPIReady = () => {
            resolve();
        };
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            script.async = true;
            document.body.appendChild(script);
        }
    });
    return youtubeApiPromise;
}
function getSafeTime(time) {
    if (typeof time === "number" && Number.isFinite(time) && time >= 0) {
        return time;
    }
    return 0;
}
function getStateTimeWithDrift(videoState) {
    const baseTime = getSafeTime(videoState.currentTime);
    if (videoState.playState !== "playing") {
        return baseTime;
    }
    const updatedAt = getSafeTime(videoState.updatedAt);
    const elapsed = updatedAt > 0 ? (Date.now() - updatedAt) / 1000 : 0;
    if (elapsed < 0 || elapsed > 30) {
        return baseTime;
    }
    return baseTime + elapsed;
}
export function YouTubePlayerBox({ videoState, canControl, onNativePlay, onNativePause, onNativeSeek, }) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const isReadyRef = useRef(false);
    const isApplyingRemoteSyncRef = useRef(false);
    const latestVideoStateRef = useRef({
        videoId: "aqz-KE-bpKQ",
        currentTime: 0,
        playState: "paused",
        updatedAt: 0,
    });
    const latestCanControlRef = useRef(false);
    const latestOnNativePlayRef = useRef(onNativePlay);
    const latestOnNativePauseRef = useRef(onNativePause);
    const latestOnNativeSeekRef = useRef(onNativeSeek);
    const loadedVideoIdRef = useRef("");
    const lastObservedTimeRef = useRef(0);
    const lastObservedAtRef = useRef(0);
    const lastSeekEmitAtRef = useRef(0);
    const lastPlayPauseEmitAtRef = useRef(0);
    const pendingPauseTimerRef = useRef(null);
    const ignorePauseUntilRef = useRef(0);
    const justSeekedUntilRef = useRef(0);
    const [isReady, setIsReady] = useState(false);
    const [playerError, setPlayerError] = useState("");
    useEffect(() => {
        latestVideoStateRef.current = videoState;
    }, [videoState]);
    useEffect(() => {
        latestCanControlRef.current = canControl;
    }, [canControl]);
    useEffect(() => {
        latestOnNativePlayRef.current = onNativePlay;
    }, [onNativePlay]);
    useEffect(() => {
        latestOnNativePauseRef.current = onNativePause;
    }, [onNativePause]);
    useEffect(() => {
        latestOnNativeSeekRef.current = onNativeSeek;
    }, [onNativeSeek]);
    function clearPendingPause() {
        if (pendingPauseTimerRef.current !== null) {
            window.clearTimeout(pendingPauseTimerRef.current);
            pendingPauseTimerRef.current = null;
        }
    }
    function lockRemoteSync(duration = 900) {
        isApplyingRemoteSyncRef.current = true;
        window.setTimeout(() => {
            isApplyingRemoteSyncRef.current = false;
        }, duration);
    }
    function applyRemoteState(state, forceVideoReload = false) {
        const player = playerRef.current;
        if (!player || !isReadyRef.current) {
            return;
        }
        clearPendingPause();
        setPlayerError("");
        const targetTime = getStateTimeWithDrift(state);
        const videoChanged = loadedVideoIdRef.current !== state.videoId;
        lockRemoteSync();
        if (videoChanged || forceVideoReload) {
            loadedVideoIdRef.current = state.videoId;
            if (state.playState === "playing") {
                player.loadVideoById({
                    videoId: state.videoId,
                    startSeconds: targetTime,
                });
                window.setTimeout(() => {
                    player.playVideo();
                }, 250);
            }
            else {
                player.cueVideoById({
                    videoId: state.videoId,
                    startSeconds: targetTime,
                });
            }
        }
        else {
            const localTime = getSafeTime(player.getCurrentTime());
            const difference = Math.abs(localTime - targetTime);
            if (difference > 1.25) {
                player.seekTo(targetTime, true);
            }
            if (state.playState === "playing") {
                player.playVideo();
                window.setTimeout(() => {
                    player.playVideo();
                }, 250);
            }
            else {
                player.pauseVideo();
            }
        }
        lastObservedTimeRef.current = targetTime;
        lastObservedAtRef.current = Date.now();
    }
    function emitPauseAfterDelay(player, currentTime) {
        clearPendingPause();
        pendingPauseTimerRef.current = window.setTimeout(() => {
            const now = Date.now();
            if (now < ignorePauseUntilRef.current || now < justSeekedUntilRef.current) {
                return;
            }
            const freshTime = getSafeTime(player.getCurrentTime());
            lastPlayPauseEmitAtRef.current = now;
            lastObservedTimeRef.current = freshTime || currentTime;
            lastObservedAtRef.current = now;
            latestOnNativePauseRef.current(freshTime || currentTime);
        }, 650);
    }
    function handleStateChange(event) {
        const player = event.target;
        if (isApplyingRemoteSyncRef.current) {
            return;
        }
        const currentTime = getSafeTime(player.getCurrentTime());
        const now = Date.now();
        const currentVideoState = latestVideoStateRef.current;
        if (!latestCanControlRef.current) {
            applyRemoteState(currentVideoState);
            return;
        }
        if (event.data === window.YT?.PlayerState.PLAYING) {
            clearPendingPause();
            if (now - lastPlayPauseEmitAtRef.current > 700) {
                lastPlayPauseEmitAtRef.current = now;
                lastObservedTimeRef.current = currentTime;
                lastObservedAtRef.current = now;
                latestOnNativePlayRef.current(currentTime);
            }
            return;
        }
        if (event.data === window.YT?.PlayerState.PAUSED) {
            if (now < ignorePauseUntilRef.current || now < justSeekedUntilRef.current) {
                return;
            }
            emitPauseAfterDelay(player, currentTime);
            return;
        }
        if (event.data === window.YT?.PlayerState.BUFFERING) {
            return;
        }
    }
    useEffect(() => {
        let isMounted = true;
        loadYouTubeIframeApi().then(() => {
            if (!isMounted || !containerRef.current || !window.YT?.Player) {
                return;
            }
            const initialState = latestVideoStateRef.current;
            const player = new window.YT.Player(containerRef.current, {
                videoId: initialState.videoId,
                width: "100%",
                height: "100%",
                playerVars: {
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    enablejsapi: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event) => {
                        if (!isMounted) {
                            return;
                        }
                        playerRef.current = event.target;
                        isReadyRef.current = true;
                        loadedVideoIdRef.current = latestVideoStateRef.current.videoId;
                        setIsReady(true);
                        setPlayerError("");
                        applyRemoteState(latestVideoStateRef.current, true);
                    },
                    onStateChange: handleStateChange,
                    onError: () => {
                        setPlayerError("This YouTube video cannot be embedded. Please choose another video below.");
                    },
                },
            });
            playerRef.current = player;
        });
        return () => {
            isMounted = false;
            isReadyRef.current = false;
            clearPendingPause();
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, []);
    useEffect(() => {
        applyRemoteState(videoState);
    }, [
        videoState.videoId,
        videoState.currentTime,
        videoState.playState,
        videoState.updatedAt,
    ]);
    useEffect(() => {
        const intervalId = window.setInterval(() => {
            const player = playerRef.current;
            if (!player || !isReadyRef.current) {
                return;
            }
            if (!latestCanControlRef.current) {
                return;
            }
            if (isApplyingRemoteSyncRef.current) {
                return;
            }
            const currentTime = getSafeTime(player.getCurrentTime());
            const currentPlayerState = player.getPlayerState();
            const now = Date.now();
            const previousObservedAt = lastObservedAtRef.current > 0 ? lastObservedAtRef.current : now;
            const elapsed = (now - previousObservedAt) / 1000;
            const expectedTime = currentPlayerState === window.YT?.PlayerState.PLAYING
                ? lastObservedTimeRef.current + elapsed
                : lastObservedTimeRef.current;
            const difference = Math.abs(currentTime - expectedTime);
            if (difference > 1.75 && now - lastSeekEmitAtRef.current > 900) {
                clearPendingPause();
                const playStateAfterSeek = latestVideoStateRef.current.playState;
                ignorePauseUntilRef.current = now + 1500;
                justSeekedUntilRef.current = now + 1500;
                lastSeekEmitAtRef.current = now;
                lastObservedTimeRef.current = currentTime;
                lastObservedAtRef.current = now;
                latestOnNativeSeekRef.current(currentTime, playStateAfterSeek);
                return;
            }
            lastObservedTimeRef.current = currentTime;
            lastObservedAtRef.current = now;
        }, 400);
        return () => {
            window.clearInterval(intervalId);
        };
    }, []);
    return (_jsx("div", { className: "overflow-hidden rounded-3xl border border-white/70 bg-black shadow-soft", children: _jsxs("div", { className: "relative aspect-video w-full", children: [_jsx("div", { ref: containerRef, className: "h-full w-full" }), !isReady && (_jsxs("div", { className: "absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 px-6 text-center text-white", children: [_jsx("div", { className: "mb-3 h-10 w-10 animate-pulse rounded-full bg-white/20" }), _jsx("p", { className: "text-lg font-bold", children: "Loading YouTube Player..." }), _jsx("p", { className: "mt-2 max-w-md text-sm text-slate-300", children: "The player uses the official YouTube IFrame API." })] })), playerError && (_jsxs("div", { className: "absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 px-6 text-center text-white", children: [_jsx("p", { className: "text-lg font-bold", children: "Video cannot be loaded" }), _jsx("p", { className: "mt-2 max-w-md text-sm text-slate-300", children: playerError })] })), !canControl && isReady && !playerError && (_jsx("div", { className: "pointer-events-auto absolute inset-0 z-20 flex items-start justify-end bg-transparent p-4", children: _jsx("span", { className: "rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur", children: "Watch only" }) }))] }) }));
}
