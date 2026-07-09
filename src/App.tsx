import {
  Building2,
  ChevronDown,
  Filter,
  FilterX,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FilterKey, Lounge } from "./types";

const filterLabels: Record<FilterKey, string> = {
  continent: "区域",
  country: "国家/地区",
  city: "城市",
  code: "机场代码",
  departureType: "出发类型",
  securityType: "安检",
};

const emptyFilters: Record<FilterKey, string> = {
  continent: "",
  country: "",
  city: "",
  code: "",
  departureType: "",
  securityType: "",
};

function splitValues(value: string) {
  return value
    .split(/[，,、/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getOptions(key: FilterKey, source: Lounge[]) {
  const values = new Set<string>();
  source.forEach((item) => {
    if (key === "departureType") {
      splitValues(item.departureType).forEach((value) => values.add(value));
      return;
    }
    const value = item[key];
    if (value) values.add(value);
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function matchesFilter(item: Lounge, key: FilterKey, value: string) {
  if (!value) return true;
  if (key === "departureType") return splitValues(item.departureType).includes(value);
  return item[key] === value;
}

function Highlight({ value, query }: { value: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{value}</>;
  const index = value.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index < 0) return <>{value}</>;
  return (
    <>
      {value.slice(0, index)}
      <mark>{value.slice(index, index + trimmed.length)}</mark>
      {value.slice(index + trimmed.length)}
    </>
  );
}

export function App() {
  const [lounges, setLounges] = useState<Lounge[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>(emptyFilters);
  const [selected, setSelected] = useState<Lounge | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/lounges.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Lounge[]>;
      })
      .then((items) => {
        if (!alive) return;
        setLounges(items);
        setSelected(items[0] ?? null);
      })
      .catch(() => {
        if (alive) setLoadError("数据加载失败，请稍后刷新重试。");
      });

    return () => {
      alive = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return lounges.filter((item) => {
      const textMatch = !normalizedQuery || item.searchText.includes(normalizedQuery);
      return (
        textMatch &&
        (Object.keys(filters) as FilterKey[]).every((key) => matchesFilter(item, key, filters[key]))
      );
    });
  }, [filters, lounges, normalizedQuery]);

  const options = useMemo(() => {
    return (Object.keys(filters) as FilterKey[]).reduce(
      (acc, key) => {
        const source = lounges.filter((item) =>
          (Object.keys(filters) as FilterKey[])
            .filter((k) => k !== key)
            .every((k) => matchesFilter(item, k, filters[k])),
        );
        acc[key] = getOptions(key, source);
        return acc;
      },
      {} as Record<FilterKey, string[]>,
    );
  }, [filters, lounges]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (query.trim() ? 1 : 0);
  const countries = new Set(lounges.map((item) => item.country)).size;
  const cities = new Set(lounges.map((item) => item.city)).size;

  function updateFilter(key: FilterKey, value: string) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "continent") { next.country = ""; next.city = ""; }
      else if (key === "country") { next.city = ""; }
      return next;
    });
  }

  function clearAll() {
    setQuery("");
    setFilters(emptyFilters);
  }

  const filterOnlyCount = Object.values(filters).filter(Boolean).length;

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Agricultural Bank Lounge Finder</p>
          <h1>农行贵宾厅查询</h1>
        </div>
        <div className="summary-strip" aria-label="数据概览">
          <span>{lounges.length} 间贵宾厅</span>
          <span>{countries} 个国家/地区</span>
          <span>{cities} 个城市</span>
        </div>
      </section>

      <section className="search-panel" aria-label="查询条件">
        <div className="search-row">
          <label className="search-box">
            <Search aria-hidden="true" size={22} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索城市、机场、三字码、贵宾厅名称或位置指引"
              autoComplete="off"
            />
          </label>
          <button
            type="button"
            className={`filter-toggle ${filtersOpen ? "open" : ""}`}
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <Filter aria-hidden="true" size={17} />
            筛选
            {filterOnlyCount > 0 && <span className="filter-badge">{filterOnlyCount}</span>}
            <ChevronDown aria-hidden="true" size={15} className="toggle-chevron" />
          </button>
        </div>

        <div className={`filters-collapsible ${filtersOpen ? "open" : ""}`}>
          <div className="filters">
            {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
              <label className="select-wrap" key={key}>
                <span>{filterLabels[key]}</span>
                <select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>
                  <option value="">全部</option>
                  {options[key].map((value) => (
                    <option value={value} key={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={16} />
              </label>
            ))}
          </div>
        </div>

        <div className="result-meta">
          <span>
            找到 <strong>{filtered.length}</strong> 条结果
          </span>
          <button type="button" onClick={clearAll} disabled={activeFilterCount === 0}>
            <FilterX aria-hidden="true" size={17} />
            清空
          </button>
        </div>
      </section>

      <section className="content-grid">
        <div className="results" aria-label="查询结果">
          {loadError && (
            <div className="empty-state">
              <Search aria-hidden="true" size={34} />
              <p>{loadError}</p>
            </div>
          )}
          {!loadError && lounges.length === 0 && (
            <div className="empty-state">
              <Search aria-hidden="true" size={34} />
              <p>正在加载贵宾厅数据</p>
            </div>
          )}
          {!loadError && lounges.length > 0 && filtered.slice(0, 200).map((item) => (
            <button
              className={`result-card ${selected?.id === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setSelected(item)}
              type="button"
            >
              <span className="code">{item.code}</span>
              <span className="result-main">
                <strong>
                  <Highlight value={item.name} query={query} />
                </strong>
                <small>
                  {item.city} · {item.airport} · {item.terminal}
                </small>
              </span>
              <span className="badge">{item.securityType}</span>
            </button>
          ))}
          {!loadError && filtered.length > 200 && <p className="limit-note">仅显示前 200 条，请继续缩小筛选范围。</p>}
          {!loadError && lounges.length > 0 && filtered.length === 0 && (
            <div className="empty-state">
              <Search aria-hidden="true" size={34} />
              <p>没有找到匹配的贵宾厅</p>
            </div>
          )}
        </div>

        <aside className="detail" aria-label="贵宾厅详情">
          {selected ? (
            <>
              <div className="detail-header">
                <span className="code large">{selected.code}</span>
                <div>
                  <p>{selected.country} / {selected.city}</p>
                  <h2>{selected.name}</h2>
                </div>
              </div>

              <div className="info-list">
                <div>
                  <Plane aria-hidden="true" size={18} />
                  <span>机场</span>
                  <strong>{selected.airport}</strong>
                </div>
                <div>
                  <Building2 aria-hidden="true" size={18} />
                  <span>航站楼</span>
                  <strong>{selected.terminal}</strong>
                </div>
                <div>
                  <ShieldCheck aria-hidden="true" size={18} />
                  <span>安检类型</span>
                  <strong>{selected.securityType}</strong>
                </div>
                <div>
                  <MapPin aria-hidden="true" size={18} />
                  <span>出发类型</span>
                  <strong>{selected.departureType}</strong>
                </div>
              </div>

              <div className="directions">
                <span>位置指引</span>
                <p>{selected.directions || "暂无位置指引"}</p>
              </div>
            </>
          ) : (
            <p>选择一条结果查看详情。</p>
          )}
        </aside>
      </section>
    </main>
  );
}
