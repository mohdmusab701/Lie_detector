import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileVideo,
  ImagePlus,
  Lock,
  Loader2,
  LogIn,
  SearchCheck,
  UserPlus,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, useAuth } from "../context/AuthContext.jsx";

const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 50 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]);

function validateFile(file) {
  if (!file) return "No file selected. Please upload an image or video to analyze.";
  if (!allowedTypes.has(file.type)) return "Unsupported file type. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM.";
  if (file.type.startsWith("image/") && file.size > IMAGE_LIMIT) return "Image file is too large. Please upload an image under 10MB.";
  if (file.type.startsWith("video/") && file.size > VIDEO_LIMIT) return "Video file is too large. Please upload a video under 50MB.";
  return "";
}

function formatArticleDate(value) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

function getRelatedArticleQuery(result, file) {
  const mediaType = result?.mediaType || (file?.type?.startsWith("video/") ? "video" : "image");
  const verdict = result?.label || "";

  return [mediaType, verdict, "AI fake media", "deepfake detection", "image manipulation", "misinformation", "synthetic media"]
    .filter(Boolean)
    .join(" ");
}

function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ERR_NETWORK") return "Backend server unavailable. Please start the backend and try again.";
  if (error.message) return error.message;
  return "Network error. Please try again.";
}

export default function UploadSection() {
  const { attempts, isLoggedIn, plan, updateUser, videoEnabled } = useAuth();
  const [state, setState] = useState("idle");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [relatedArticlesState, setRelatedArticlesState] = useState("idle");
  const [relatedArticlesError, setRelatedArticlesError] = useState("");
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const uploadToastShownRef = useRef(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const selectFile = (file) => {
    const validationError = validateFile(file);
    setResult(null);
    setRelatedArticles([]);
    setRelatedArticlesState("idle");
    setRelatedArticlesError("");
    setUploadProgress(0);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setState("idle");
      setToast({ type: "error", message: validationError });
      return;
    }

    if (file.type.startsWith("video/") && !videoEnabled) {
      const message = "Video detection is available only on paid plans.";
      setError(message);
      setSelectedFile(null);
      setState("idle");
      setToast({ type: "error", message });
      return;
    }

    setError("");
    setSelectedFile(file);
    setState("idle");
    setToast(null);
  };

  const handleInputChange = (event) => {
    selectFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files?.[0]);
  };

  const analyzeMedia = async () => {
    if (attempts <= 0) {
      const message = "Free trial limit reached. Upgrade your plan to continue scanning.";
      setError(message);
      setToast({ type: "error", message });
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setToast({ type: "error", message: validationError });
      return;
    }

    if (selectedFile.type.startsWith("video/") && !videoEnabled) {
      const message = "Video detection is available only on paid plans.";
      setError(message);
      setToast({ type: "error", message });
      return;
    }

    const formData = new FormData();
    formData.append("media", selectedFile);

    try {
      setError("");
      setResult(null);
      setRelatedArticles([]);
      setRelatedArticlesState("idle");
      setRelatedArticlesError("");
      setUploadProgress(0);
      uploadToastShownRef.current = false;
      setState("uploading");

      const response = await apiClient.post("/api/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          if (percent >= 100) {
            setState("analyzing");
            if (!uploadToastShownRef.current) {
              uploadToastShownRef.current = true;
              setToast({ type: "success", message: "Successfully Uploaded" });
            }
          }
        },
      });

      if (!response.data?.success) {
        throw new Error("Invalid Sightengine response. Please try another file.");
      }

      setResult(response.data);
      setState("done");
      updateUser({
        attemptsLeft: response.data.attemptsLeft,
        plan: response.data.plan,
        videoEnabled: response.data.videoEnabled,
      });
      setToast({ type: "success", message: "Media uploaded successfully. Analysis completed." });

      try {
        setRelatedArticlesState("loading");
        setRelatedArticlesError("");
        const query = getRelatedArticleQuery(response.data, selectedFile);
        const relatedResponse = await apiClient.get("/api/news/related", {
          params: { query, limit: 2 },
        });
        const articles = Array.isArray(relatedResponse.data?.articles) ? relatedResponse.data.articles.slice(0, 2) : [];
        setRelatedArticles(articles);
        setRelatedArticlesState("done");
        if (!articles.length) {
          setRelatedArticlesError("No related articles found right now.");
        }
      } catch {
        setRelatedArticles([]);
        setRelatedArticlesState("error");
        setRelatedArticlesError("No related articles found right now.");
      }
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      setState("idle");
      setToast({ type: "error", message });
    }
  };

  const isBusy = state === "uploading" || state === "analyzing";
  const isVideo = selectedFile?.type.startsWith("video/");
  const isImage = selectedFile?.type.startsWith("image/");
  const limitReached = attempts <= 0;

  return (
    <section id="upload" className="container-shell py-20">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed right-4 top-24 z-[80] max-w-sm rounded-2xl border p-4 text-sm shadow-2xl backdrop-blur-2xl ${
            toast.type === "success"
              ? "border-mintGlow/25 bg-black/75 text-mintGlow"
              : "border-roseGlow/25 bg-black/75 text-roseGlow"
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyanGlow">AI detection</p>
        <h2 className="section-title mt-3">Upload media for an authenticity scan</h2>
        <p className="section-copy mx-auto">
          Upload an image or video and Lie_detector will send it securely to the backend AI detection engine for analysis.
        </p>
      </div>

      {!isLoggedIn ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mx-auto mt-10 max-w-3xl rounded-3xl p-6 text-center sm:p-8"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-cyanGlow/25 bg-cyanGlow/10 text-cyanGlow shadow-[0_0_18px_rgba(134,217,232,0.12)]">
            <Lock className="h-9 w-9" />
          </div>
          <h3 className="mt-6 text-2xl font-black text-white">Login required to scan media.</h3>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-stone-400">
            Create a free trial account to unlock 5 image scans and keep your demo plan state in this browser.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/login" className="ghost-button">
              Login <LogIn className="h-4 w-4" />
            </Link>
            <Link to="/signup" className="glow-button">
              Create Account <UserPlus className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.14em]">
            <span className="rounded-full border border-cyanGlow/20 bg-cyanGlow/10 px-3 py-2 text-cyanGlow">
              {plan} plan
            </span>
            <span className="rounded-full border border-amberGlow/20 bg-black/75 px-3 py-2 text-amberGlow">
              {attempts} attempts remaining
            </span>
            {!videoEnabled && (
              <span className="rounded-full border border-white/10 bg-black/75 px-3 py-2 text-stone-400">
                Image upload only
              </span>
            )}
          </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div whileHover={{ y: -4 }} className="glass-card rounded-3xl border-dashed p-6 sm:p-8">
          <div
            className="grid min-h-[340px] place-items-center rounded-2xl border border-dashed border-cyanGlow/25 bg-black/75 p-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={handleInputChange}
            />

            <div className="w-full">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-cyanGlow/20 bg-black/75 shadow-[0_0_16px_rgba(134,217,232,0.10)]">
                <UploadCloud className="h-9 w-9 text-cyanGlow" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">Drag and drop image or video</h3>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                JPG, PNG, WEBP up to 10MB. MP4, MOV, WEBM up to 50MB.
              </p>

              {previewUrl && (
                <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/75 text-left">
                  {isImage && <img src={previewUrl} alt="Selected upload preview" className="h-48 w-full object-cover" />}
                  {isVideo && <video src={previewUrl} className="h-48 w-full object-cover" controls />}
                  <div className="p-4">
                    <p className="truncate text-sm font-semibold text-white">{selectedFile.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              )}

              <div className="mt-5 flex justify-center gap-3 text-xs text-stone-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                  <ImagePlus className="h-4 w-4 text-cyanGlow" /> Images
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                  <FileVideo className="h-4 w-4 text-violetGlow" /> Videos
                </span>
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
                  Choose File
                </button>
                <button type="button" className="glow-button disabled:cursor-not-allowed disabled:opacity-50" onClick={analyzeMedia} disabled={!selectedFile || isBusy || limitReached}>
                  {isBusy ? "Analyzing..." : "Analyze Media"}
                </button>
              </div>

              {limitReached && (
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-amberGlow">
                  Free trial limit reached. Upgrade your plan to continue scanning.
                </p>
              )}
              {error && <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-roseGlow">{error}</p>}
            </div>
          </div>
        </motion.div>

        <div className="glass-card rounded-3xl p-6 sm:p-8">
          {state === "idle" && !result && (
            <div className="flex h-full min-h-[340px] flex-col justify-center">
              <AlertTriangle className="h-9 w-9 text-cyanGlow" />
              <h3 className="mt-5 text-2xl font-bold text-white">Awaiting sample media</h3>
              <p className="mt-3 leading-7 text-stone-400">
                Select a valid image or video, then analyze it with the backend Sightengine integration.
              </p>
            </div>
          )}

          {isBusy && (
            <div className="min-h-[340px]">
              <div className="flex items-center gap-3 text-cyanGlow">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">
                  {state === "uploading" ? "Uploading media..." : "Analyzing media with AI detection engine..."}
                </span>
              </div>
              <div className="mt-8 space-y-4">
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
                  <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                    <span>Upload progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-cyanGlow" animate={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === "done" && result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="min-h-[340px]">
              <div className="flex items-center gap-3 text-mintGlow">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-semibold">Analysis complete</span>
              </div>
              <div className="mt-7 rounded-2xl border border-roseGlow/25 bg-roseGlow/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-roseGlow">Result</p>
                <p className="mt-3 text-4xl font-black text-white">AI Generated Chance: {result.aiProbability}%</p>
                <p className="mt-3 text-2xl font-bold text-stone-100">Real Media Chance: {result.realProbability}%</p>
                <p className="mt-3 leading-7 text-stone-300">{result.label}</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm text-stone-400">Confidence</p>
                  <p className="mt-2 text-2xl font-bold text-cyanGlow">{result.confidenceText}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm text-stone-400">Media type</p>
                  <p className="mt-2 text-2xl font-bold capitalize text-violetGlow">{result.mediaType}</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <SearchCheck className="h-5 w-5 text-cyanGlow" />
                  <h3 className="font-bold">Related AI Fake Media Articles</h3>
                </div>
                <div className="space-y-3">
                  {relatedArticlesState === "loading" && (
                    <div className="rounded-2xl border border-white/10 bg-black/75 p-4 text-sm text-stone-400">
                      Loading related articles...
                    </div>
                  )}
                  {relatedArticlesState !== "loading" && relatedArticlesError && (
                    <div className="rounded-2xl border border-white/10 bg-black/75 p-4 text-sm text-stone-400">
                      {relatedArticlesError}
                    </div>
                  )}
                  {relatedArticlesState !== "loading" && relatedArticles.map((article) => (
                    <article key={article.title} className="rounded-2xl border border-white/10 bg-black/75 p-4 transition duration-300 hover:border-cyanGlow/25 hover:bg-white/[0.035]">
                      <h4 className="font-semibold leading-6 text-white">{article.title}</h4>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
                        <span>{article.source}</span>
                        <span>{formatArticleDate(article.publishedAt)}</span>
                      </div>
                      {article.description && <p className="mt-2 text-sm leading-6 text-stone-400">{article.description}</p>}
                      <a href={article.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyanGlow transition hover:text-white">
                        Read More <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-cyanGlow/15 bg-black/75 p-4 text-sm leading-6 text-stone-300">
                Lie_detector can make mistakes. AI-based results are predictions, not guaranteed proof.
                <button type="button" onClick={() => setDisclaimerOpen(true)} className="ml-2 font-semibold text-cyanGlow transition hover:text-white">
                  Read More
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
        </>
      )}

      {disclaimerOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass-card max-w-2xl rounded-3xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyanGlow">Accuracy disclaimer</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Prediction, not final proof</h3>
              </div>
              <button type="button" onClick={() => setDisclaimerOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/75 text-stone-300 transition hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-5 leading-8 text-stone-300">
              Lie_detector is an AI-oriented media analysis platform. The results shown by the system are based on AI models, visual patterns, metadata signals, and probability-based analysis. Because AI detection itself is not always 100% accurate, the result should not be treated as final legal or factual proof. Users should verify important media from trusted sources before making decisions or sharing content. Lie_detector aims to support awareness, reduce misinformation, and help users think critically, but it cannot guarantee perfect accuracy in every case.
            </p>
            <button type="button" onClick={() => setDisclaimerOpen(false)} className="glow-button mt-6">
              I Understand
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
