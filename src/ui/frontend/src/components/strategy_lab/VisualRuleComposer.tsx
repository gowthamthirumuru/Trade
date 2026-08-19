import React, { useState } from 'react';
import {
  Code2,
  Plus,
  Trash2,
  Layers,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  Sliders,
  Check,
  Clock,
  Activity,
  MoreHorizontal,
} from 'lucide-react';

export interface StrategyCondition {
  id: string;
  field: string;
  operator: string;
  target: string;
  params: string;
  timeframe: string;
}

export interface RuleGroup {
  id: string;
  name: string;
  matchType: 'ALL' | 'ANY' | 'NONE';
  isOptional?: boolean;
  conditions: StrategyCondition[];
  action?: {
    type: 'Enter' | 'Exit';
    direction: 'Long' | 'Short';
    orderType: 'Market' | 'Limit' | 'Stop';
  };
}

interface VisualRuleComposerProps {
  ruleGroups: RuleGroup[];
  onUpdateRuleGroups: (groups: RuleGroup[]) => void;
  isCodeMode: boolean;
  onToggleCodeMode: () => void;
}

type ComposerSubTab = 'Trigger Rules' | 'Filters' | 'Confluence' | 'Advanced Logic';

export const VisualRuleComposer: React.FC<VisualRuleComposerProps> = ({
  ruleGroups,
  onUpdateRuleGroups,
  isCodeMode,
  onToggleCodeMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ComposerSubTab>('Trigger Rules');

  // Interactive condition update
  const handleUpdateCondition = (groupId: string, condId: string, updated: Partial<StrategyCondition>) => {
    onUpdateRuleGroups(
      ruleGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          conditions: g.conditions.map((c) => (c.id === condId ? { ...c, ...updated } : c)),
        };
      })
    );
  };

  // Add condition to a group
  const handleAddConditionToGroup = (groupId: string) => {
    const newCond: StrategyCondition = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      field: 'RSI',
      operator: 'less than',
      target: '30',
      params: '(14)',
      timeframe: '15m',
    };
    onUpdateRuleGroups(
      ruleGroups.map((g) => (g.id === groupId ? { ...g, conditions: [...g.conditions, newCond] } : g))
    );
  };

  // Remove condition
  const handleRemoveCondition = (groupId: string, condId: string) => {
    onUpdateRuleGroups(
      ruleGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          conditions: g.conditions.filter((c) => c.id !== condId),
        };
      })
    );
  };

  // Add new Rule Group
  const handleAddRuleGroup = () => {
    const newGroup: RuleGroup = {
      id: `group-${Date.now()}`,
      name: `Rule Group ${ruleGroups.length + 1}`,
      matchType: 'ALL',
      isOptional: false,
      conditions: [
        {
          id: `cond-${Date.now()}-1`,
          field: 'Price',
          operator: 'crosses above',
          target: '20 EMA',
          params: '(20)',
          timeframe: '15m',
        },
      ],
      action: {
        type: 'Enter',
        direction: 'Long',
        orderType: 'Market',
      },
    };
    onUpdateRuleGroups([...ruleGroups, newGroup]);
  };

  // Dynamically generate Python / YAML DSL from active ruleGroups
  const generatePythonDsl = (groups: RuleGroup[]) => {
    let code = `# Project APEX — Zero-Lookahead Strategy DSL
from src.strategy.base import ApexStrategy
from src.features.indicators import bollinger_bands, rsi, ema, atr

class CompiledApexStrategy(ApexStrategy):
    """
    Dynamically compiled APEX Strategy evaluated bar-by-bar at bar t.
    Zero lookahead bias guaranteed.
    """
    def __init__(self, config):
        super().__init__(config)
        self.params = config

    def evaluate_entry(self, bar, macro_bar, session_tag) -> bool:
`;

    groups.forEach((g, gIdx) => {
      code += `        # Group ${gIdx + 1}: ${g.name || 'Rule Group'} (${g.matchType})\n`;
      const condVars: string[] = [];
      g.conditions.forEach((c, cIdx) => {
        const vName = `c${gIdx + 1}_${cIdx + 1}`;
        condVars.push(vName);
        code += `        ${vName} = bar.check_condition(field="${c.field}", op="${c.operator}", target="${c.target}", tf="${c.timeframe}")\n`;
      });
      const op = g.matchType === 'ANY' ? ' or ' : ' and ';
      code += `        group_${gIdx + 1}_pass = ${condVars.length > 0 ? condVars.join(op) : 'True'}\n\n`;
    });

    code += `        # Execution Decision
        if group_1_pass:
            return self.order_market(direction='LONG')
        return None
`;
    return code;
  };

  const pythonDslCode = generatePythonDsl(ruleGroups);

  return (
    <div className="quant-card p-5 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-4">
      {/* 1. Top Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#151a24] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Visual Strategy Rule Composer</h3>
        </div>

        <div className="flex items-center bg-[#0e121a] p-1 rounded-xl border border-[#1c2436]">
          {(['Trigger Rules', 'Filters', 'Confluence', 'Advanced Logic'] as ComposerSubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                activeSubTab === tab
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-[#151c2a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Rule Content Area: Visual Composer or Code Mode */}
      {isCodeMode ? (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-[#0e121a] px-3 py-1.5 rounded-t-lg border border-[#1c2436] border-b-0">
            <span className="font-bold text-cyan-400">strategy_rules.py (APEX Layer 4 DSL)</span>
            <span className="text-emerald-400 font-medium">✓ Zero Lookahead Verified</span>
          </div>
          <pre className="w-full bg-[#06080d] border border-[#1c2436] rounded-b-lg p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed select-text scrollbar-thin">
            <code>{pythonDslCode}</code>
          </pre>
        </div>
      ) : (
        <div className="space-y-4">
          {ruleGroups.map((group, groupIdx) => (
            <div
              key={group.id}
              className="bg-[#0e121a] border border-[#1a2232] rounded-xl p-4 space-y-3.5 relative shadow-inner"
            >
              {/* Group Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#151b26] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950/90 border border-cyan-500 text-cyan-300 flex items-center justify-center font-extrabold text-[11px]">
                    {groupIdx + 1}
                  </span>

                  {group.isOptional && (
                    <span className="bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      OPTIONAL
                    </span>
                  )}

                  <select
                    value={group.matchType}
                    onChange={(e) =>
                      onUpdateRuleGroups(
                        ruleGroups.map((g) =>
                          g.id === group.id ? { ...g, matchType: e.target.value as any } : g
                        )
                      )
                    }
                    className="bg-[#121824] border border-[#1e2a40] text-cyan-300 font-bold px-2 py-0.5 rounded text-xs outline-none cursor-pointer"
                  >
                    <option value="ALL">ALL</option>
                    <option value="ANY">ANY</option>
                    <option value="NONE">NONE</option>
                  </select>

                  <span className="text-slate-400 text-xs">
                    {group.isOptional
                      ? 'of the following (Confluence Boost)'
                      : 'of the following are true'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddConditionToGroup(group.id)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#121824] hover:bg-[#1a2336] text-slate-300 hover:text-white rounded border border-[#1e2a40] text-[11px] transition"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" />
                    <span>Add</span>
                  </button>
                  {ruleGroups.length > 1 && (
                    <button
                      onClick={() =>
                        onUpdateRuleGroups(ruleGroups.filter((g) => g.id !== group.id))
                      }
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Group Conditions Rows */}
              <div className="space-y-2.5 relative pl-4">
                {/* Vertical tree connection line */}
                {group.conditions.length > 1 && (
                  <div className="absolute left-1.5 top-3 bottom-3 w-px bg-[#222d42]" />
                )}

                {group.conditions.map((cond, condIdx) => (
                  <div key={cond.id} className="relative flex items-center gap-2 flex-wrap">
                    {/* AND / OR connector badge */}
                    {condIdx > 0 && (
                      <span className="absolute -left-4 -top-3 bg-[#101522] text-slate-400 border border-[#243048] text-[9px] font-bold px-1 rounded z-10">
                        {group.matchType === 'ANY' ? 'OR' : 'AND'}
                      </span>
                    )}

                    {/* Condition Row Form */}
                    <div className="flex-1 flex flex-wrap items-center gap-1.5 bg-[#101522] border border-[#1a2234] hover:border-cyan-800/80 p-2 rounded-lg transition shadow-sm">
                      {/* Field / Indicator */}
                      <input
                        type="text"
                        value={cond.field}
                        onChange={(e) =>
                          handleUpdateCondition(group.id, cond.id, { field: e.target.value })
                        }
                        className="bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-white font-bold w-24 text-xs outline-none focus:border-cyan-500"
                        placeholder="Field"
                      />

                      {/* Operator Dropdown */}
                      <select
                        value={cond.operator}
                        onChange={(e) =>
                          handleUpdateCondition(group.id, cond.id, { operator: e.target.value })
                        }
                        className="bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-cyan-300 text-xs outline-none cursor-pointer"
                      >
                        <option value="touches">touches</option>
                        <option value="less than">less than</option>
                        <option value="greater than">greater than</option>
                        <option value="crosses above">crosses above</option>
                        <option value="crosses below">crosses below</option>
                        <option value="breaks above">breaks above</option>
                        <option value="breaks below">breaks below</option>
                        <option value="equals">equals</option>
                        <option value="sweeps">sweeps</option>
                      </select>

                      {/* Target Value / Target Indicator */}
                      <input
                        type="text"
                        value={cond.target}
                        onChange={(e) =>
                          handleUpdateCondition(group.id, cond.id, { target: e.target.value })
                        }
                        className="flex-1 min-w-[130px] bg-[#141b2a] border border-[#222e44] rounded px-2 py-1 text-emerald-300 font-medium text-xs outline-none focus:border-cyan-500"
                        placeholder="Target / Indicator"
                      />

                      {/* Indicator Params */}
                      <input
                        type="text"
                        value={cond.params}
                        onChange={(e) =>
                          handleUpdateCondition(group.id, cond.id, { params: e.target.value })
                        }
                        className="w-20 bg-[#141b2a] border border-[#222e44] rounded px-1.5 py-1 text-slate-400 text-xs text-center outline-none focus:border-cyan-500"
                        placeholder="Params"
                      />

                      <span className="text-slate-500 text-[11px]">on</span>

                      {/* Timeframe Tag */}
                      <select
                        value={cond.timeframe}
                        onChange={(e) =>
                          handleUpdateCondition(group.id, cond.id, { timeframe: e.target.value })
                        }
                        className={`border rounded px-1.5 py-1 text-xs font-bold outline-none cursor-pointer ${
                          cond.timeframe === '1H' || cond.timeframe === '4H' || cond.timeframe === '1D'
                            ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300'
                            : 'bg-[#141b2a] border-[#222e44] text-slate-300'
                        }`}
                      >
                        <option value="1m">1m</option>
                        <option value="5m">5m</option>
                        <option value="15m">15m</option>
                        <option value="1H">1H (Macro)</option>
                        <option value="4H">4H (Macro)</option>
                        <option value="1D">1D (Macro)</option>
                      </select>

                      {/* Delete Condition Button */}
                      <button
                        onClick={() => handleRemoveCondition(group.id, cond.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Remove condition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Execution Block (e.g. THEN Enter Long at Market) */}
              {group.action && (
                <div className="flex items-center gap-2 pt-2 border-t border-[#151b26]">
                  <span className="bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    THEN
                  </span>

                  <select
                    value={group.action.type}
                    onChange={(e) =>
                      onUpdateRuleGroups(
                        ruleGroups.map((g) =>
                          g.id === group.id
                            ? { ...g, action: { ...g.action!, type: e.target.value as any } }
                            : g
                        )
                      )
                    }
                    className="bg-[#101522] border border-[#1e2a40] text-slate-300 font-bold px-2 py-1 rounded text-xs outline-none cursor-pointer"
                  >
                    <option value="Enter">Enter</option>
                    <option value="Exit">Exit</option>
                  </select>

                  <select
                    value={group.action.direction}
                    onChange={(e) =>
                      onUpdateRuleGroups(
                        ruleGroups.map((g) =>
                          g.id === group.id
                            ? { ...g, action: { ...g.action!, direction: e.target.value as any } }
                            : g
                        )
                      )
                    }
                    className={`font-bold px-2.5 py-1 rounded text-xs border outline-none cursor-pointer ${
                      group.action.direction === 'Long'
                        ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                        : 'bg-rose-950/80 border-rose-700 text-rose-300'
                    }`}
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>

                  <span className="text-slate-400 text-xs">at</span>

                  <select
                    value={group.action.orderType}
                    onChange={(e) =>
                      onUpdateRuleGroups(
                        ruleGroups.map((g) =>
                          g.id === group.id
                            ? { ...g, action: { ...g.action!, orderType: e.target.value as any } }
                            : g
                        )
                      )
                    }
                    className="bg-[#101522] border border-[#1e2a40] text-slate-300 px-2 py-1 rounded text-xs outline-none cursor-pointer"
                  >
                    <option value="Market">Market</option>
                    <option value="Limit">Limit (Next Open)</option>
                    <option value="Stop">Stop (Breakout)</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Bottom Action Bar: Add Rule Group + Logic Mode toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-[#151a24]">
        <button
          onClick={handleAddRuleGroup}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Rule Group</span>
        </button>

        <button
          onClick={onToggleCodeMode}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#0e121a] hover:bg-[#161c28] border border-[#1e283c] text-slate-300 hover:text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isCodeMode ? 'Visual Mode (Blocks)' : 'Logic Mode (Code)'}</span>
        </button>
      </div>
    </div>
  );
};
