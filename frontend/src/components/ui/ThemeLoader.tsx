interface ThemeLoaderProps {
  label?: string;
  size?: number;
  minHeight?: number | string;
}

export default function ThemeLoader({ label, size = 48, minHeight = 260 }: ThemeLoaderProps) {
  return (
    <div className="theme-loader" style={{ minHeight }}>
      <div className="theme-loader-anim" style={{ width: size, height: size }}>
        <span className="theme-loader-ring" />
        <span className="theme-loader-core" />
        <span className="theme-loader-orbit theme-loader-orbit-1" />
        <span className="theme-loader-orbit theme-loader-orbit-2" />
        <span className="theme-loader-orbit theme-loader-orbit-3" />
      </div>
      {label && <p className="theme-loader-label">{label}</p>}
    </div>
  );
}
