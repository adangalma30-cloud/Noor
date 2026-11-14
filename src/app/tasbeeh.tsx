import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Card, Chip, Divider, Icon, Screen, SectionTitle, Segmented, Sub, Title } from '../components/ui';
import { TASBEEH_PRESETS } from '../data/adhkar';
import {
  TARGET_CHOICES,
  addItem,
  applyCount,
  cycleComplete,
  newSequence,
  removeItem,
  reorderItems,
  setTarget,
  startNextCycle,
  todayKey,
} from '../lib/tasbeeh';
import { updateProgress, updateSettings, useProgress, useSettings } from '../lib/store';
import { Radius, Spacing, arabicStyle, useTheme } from '../theme';
import type { DhikrItem } from '../types';

type Mode = 'sequence' | 'free';

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm }}
    >
      <Text style={{ color: t.text, fontSize: 13, flex: 1 }}>{label}</Text>
      <View
        style={{
          width: 44,
          height: 25,
          borderRadius: 13,
          backgroundColor: value ? t.primary : t.track,
          justifyContent: 'center',
          paddingHorizontal: 3,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ width: 19, height: 19, borderRadius: 10, backgroundColor: '#fff' }} />
      </View>
    </Pressable>
  );
}

function Progress({ value, max }: { value: number; max: number }) {
  const t = useTheme();
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: t.track, overflow: 'hidden', width: '100%' }}>
      <View style={{ height: 8, width: `${pct * 100}%`, backgroundColor: t.gold, borderRadius: 4 }} />
    </View>
  );
}

export default function TasbeehScreen() {
  const t = useTheme();
  const progress = useProgress();
  const settings = useSettings();
  const [mode, setMode] = useState<Mode>('sequence');
  const [editing, setEditing] = useState(false);
  const [justAdvanced, setJustAdvanced] = useState<string | null>(null);
  const [showCustomTarget, setShowCustomTarget] = useState(false);
  const [customTarget, setCustomTarget] = useState('');
  const [addAr, setAddAr] = useState('');
  const [addTr, setAddTr] = useState('');
  const [addEn, setAddEn] = useState('');

  // ---- Free-count (classic) mode state ----
  const [presetAr, setPresetAr] = useState(progress.tasbeeh.preset || TASBEEH_PRESETS[0].ar);
  const preset = TASBEEH_PRESETS.find((p) => p.ar === presetAr) ?? TASBEEH_PRESETS[0];
  const freeCount = progress.tasbeeh.preset === presetAr ? progress.tasbeeh.count : 0;
  const total = progress.tasbeeh.total;

  // ---- Sequence mode state ----
  const seq = progress.tasbeehSeq;
  const dayKey = todayKey();
  const stats = progress.dhikrStats[dayKey] ?? { counts: {}, cycles: 0 };
  const currentItem: DhikrItem | undefined = seq.items[seq.index];
  const done = cycleComplete(seq);
  const dayTotal = useMemo(() => Object.values(stats.counts).reduce((a, b) => a + b, 0), [stats]);

  const buzz = (kind: 'count' | 'target') => {
    if (!settings.vibrateEnabled) return;
    if (kind === 'count' && settings.vibrateOnCount) {
      Haptics.selectionAsync().catch(() => {});
    }
    if (kind === 'target' && settings.vibrateOnTarget) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const tapSequence = () => {
    if (done || !currentItem) return;
    const res = applyCount(seq, stats);
    const dhikrStats = { ...progress.dhikrStats, [dayKey]: res.stats };
    updateProgress({
      tasbeehSeq: res.seq,
      dhikrStats,
      tasbeeh: { ...progress.tasbeeh, total: progress.tasbeeh.total + 1 },
    });
    if (res.completedItem) {
      buzz('target');
      const nextName = res.cycleDone
        ? 'Sequence complete!'
        : res.seq.items[res.seq.index]?.translit ?? '';
      setJustAdvanced(res.cycleDone ? `cycle:${res.completedItemInfo?.id}` : `${res.completedItemInfo?.id}→${nextName}`);
      setTimeout(() => setJustAdvanced(null), 3200);
    } else {
      buzz('count');
    }
  };

  const tapFree = () => {
    Haptics.selectionAsync().catch(() => {});
    const next = freeCount + 1;
    if (next === preset.target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    updateProgress({ tasbeeh: { count: next, total: total + 1, preset: presetAr } });
  };

  const confirmResetSession = () => {
    Alert.alert('Reset session?', 'This clears the current cycle (counters and completed marks). Lifetime totals are kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => updateProgress({ tasbeehSeq: { ...seq, ...resetItemsSafe(seq) } }),
      },
    ]);
  };

  const resetItemsSafe = (s: typeof seq) => ({ index: 0, count: 0, completed: s.items.map(() => false) });

  return (
    <Screen>
      <Title>Smart Tasbeeh</Title>
      <Sub style={{ marginTop: 6 }}>
        Count, complete each Dhikr, and advance automatically through your sequence. Progress is saved on
        this device — closing the app never loses your place.
      </Sub>

      <View style={{ marginTop: Spacing.lg }}>
        <Segmented<Mode>
          options={[
            { value: 'sequence', label: 'Smart sequence' },
            { value: 'free', label: 'Free count' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </View>

      {mode === 'sequence' && (
        <>
          {/* Sequence strip */}
          <SectionTitle>Sequence</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'center' }}>
            {seq.items.map((item, i) => {
              const isCurrent = i === seq.index && !done;
              const isDone = seq.completed[i];
              return (
                <View
                  key={`${item.id}-${i}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: isDone ? t.goldSoft : isCurrent ? t.primary : t.card,
                    borderRadius: Radius.pill,
                    borderWidth: 1,
                    borderColor: isCurrent ? t.primary : isDone ? t.gold : t.border,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      color: isDone ? t.gold : isCurrent ? t.onPrimary : t.sub,
                      fontWeight: '800',
                      fontSize: 11,
                    }}
                  >
                    {isDone ? '✓' : `${i + 1}`}
                  </Text>
                  <Text
                    style={{
                      color: isDone ? t.text : isCurrent ? t.onPrimary : t.sub,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {item.translit || item.ar}
                  </Text>
                </View>
              );
            })}
            <Pressable
              onPress={() => setEditing((e) => !e)}
              style={{
                backgroundColor: t.card,
                borderRadius: Radius.pill,
                borderWidth: 1,
                borderColor: t.border,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="gear" size={13} color={t.sub} />
              <Text style={{ color: t.sub, fontWeight: '700', fontSize: 12 }}>{editing ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>

          {editing && (
            <Card style={{ marginTop: Spacing.md }}>
              {seq.items.map((item, i) => (
                <View key={`edit-${item.id}-${i}`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 }}>
                    <Text style={{ color: t.sub, fontSize: 11, fontWeight: '800', width: 18 }}>{i + 1}.</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.text, fontWeight: '700', fontSize: 13 }}>{item.translit || item.ar}</Text>
                      <Text style={{ color: t.sub, fontSize: 11 }} numberOfLines={1}>
                        {item.meaning}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        updateProgress({ tasbeehSeq: { ...seq, items: reorderItems(seq.items, i, i - 1), completed: seq.completed } })
                      }
                      disabled={i === 0}
                      hitSlop={8}
                    >
                      <Text style={{ color: i === 0 ? t.border : t.gold, fontSize: 18, fontWeight: '900' }}>↑</Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        updateProgress({ tasbeehSeq: { ...seq, items: reorderItems(seq.items, i, i + 1), completed: seq.completed } })
                      }
                      disabled={i === seq.items.length - 1}
                      hitSlop={8}
                    >
                      <Text style={{ color: i === seq.items.length - 1 ? t.border : t.gold, fontSize: 18, fontWeight: '900' }}>↓</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => updateProgress({ tasbeehSeq: removeItem(seq, i) })}
                      disabled={seq.items.length <= 1}
                      hitSlop={8}
                    >
                      <Text style={{ color: seq.items.length <= 1 ? t.border : '#C05746', fontSize: 15, fontWeight: '800' }}>✕</Text>
                    </Pressable>
                  </View>
                  {i < seq.items.length - 1 && <Divider />}
                </View>
              ))}

              <Divider />
              <Text style={{ color: t.sub, fontSize: 11, fontWeight: '700', marginTop: Spacing.sm, marginBottom: 6 }}>
                ADD A DHIKR
              </Text>
              <TextInput
                value={addAr}
                onChangeText={setAddAr}
                placeholder="Arabic (e.g. سُبْحَانَ اللَّهِ)"
                placeholderTextColor={t.sub}
                style={{ ...inputStyle(t), textAlign: 'right', writingDirection: 'rtl' }}
              />
              <TextInput
                value={addTr}
                onChangeText={setAddTr}
                placeholder="Transliteration (e.g. SubhanAllah)"
                placeholderTextColor={t.sub}
                style={inputStyle(t)}
              />
              <TextInput
                value={addEn}
                onChangeText={setAddEn}
                placeholder="Meaning (e.g. Glory be to Allah)"
                placeholderTextColor={t.sub}
                style={inputStyle(t)}
              />
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
                <Pressable
                  onPress={() => {
                    const ar = addAr.trim();
                    const tr = addTr.trim();
                    if (!ar && !tr) {
                      Alert.alert('Add a Dhikr', 'Please enter the Arabic text or a transliteration.');
                      return;
                    }
                    updateProgress({
                      tasbeehSeq: addItem(seq, {
                        id: `custom-${Date.now()}`,
                        ar: ar || tr,
                        translit: tr || ar,
                        meaning: addEn.trim(),
                      }),
                    });
                    setAddAr('');
                    setAddTr('');
                    setAddEn('');
                  }}
                  style={{ ...btnStyle(t), backgroundColor: t.gold, borderColor: t.gold }}
                >
                  <Text style={{ color: '#12251C', fontWeight: '800', fontSize: 12 }}>Add to sequence</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Restore default sequence?', 'This replaces your current sequence with the four default Dhikr.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Restore', style: 'destructive', onPress: () => updateProgress({ tasbeehSeq: newSequence() }) },
                    ])
                  }
                  style={btnStyle(t)}
                >
                  <Text style={{ color: t.text, fontWeight: '700', fontSize: 12 }}>Restore defaults</Text>
                </Pressable>
              </View>
            </Card>
          )}

          {/* Current Dhikr */}
          <SectionTitle>Now reciting</SectionTitle>
          <Card style={{ alignItems: 'center' }}>
            <Text style={{ ...arabicStyle(34, t.gold, true), textAlign: 'center', writingDirection: 'rtl' }}>
              {currentItem?.ar ?? ''}
            </Text>
            <Text style={{ color: t.text, fontWeight: '800', fontSize: 17, marginTop: Spacing.sm }}>
              {currentItem?.translit ?? ''}
            </Text>
            <Text style={{ color: t.sub, fontSize: 13, marginTop: 3 }}>{currentItem?.meaning ?? ''}</Text>
            <Text style={{ color: t.gold, fontSize: 11, fontWeight: '700', marginTop: Spacing.sm }}>
              Dhikr {Math.min(seq.index + 1, seq.items.length)} of {seq.items.length}
            </Text>
          </Card>

          {justAdvanced && (
            <View
              style={{
                marginTop: Spacing.md,
                backgroundColor: t.goldSoft,
                borderRadius: Radius.md,
                borderWidth: 1,
                borderColor: t.gold,
                padding: Spacing.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 13 }}>
                {justAdvanced.startsWith('cycle:')
                  ? '🎉 Sequence complete — well done!'
                  : `✓ ${justAdvanced.split('→')[0]} completed — advanced automatically`}
              </Text>
            </View>
          )}

          {/* Counter */}
          <View style={{ alignItems: 'center', marginTop: Spacing.xl }}>
            {done ? (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <Text style={{ color: t.gold, fontSize: 44 }}>✓</Text>
                <Text style={{ color: t.text, fontSize: 19, fontWeight: '800', marginTop: Spacing.sm, textAlign: 'center' }}>
                  Sequence complete!
                </Text>
                <Text style={{ color: t.sub, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
                  {seq.cycles} cycle{seq.cycles === 1 ? '' : 's'} completed all-time · {stats.cycles} today
                </Text>
                <Pressable
                  onPress={() => updateProgress({ tasbeehSeq: startNextCycle(seq) })}
                  style={{
                    marginTop: Spacing.lg,
                    backgroundColor: t.gold,
                    borderRadius: Radius.pill,
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.xl * 1.4,
                  }}
                >
                  <Text style={{ color: '#12251C', fontWeight: '900', fontSize: 15 }}>Start another cycle</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  onPress={tapSequence}
                  style={({ pressed }) => ({
                    width: 230,
                    height: 230,
                    borderRadius: 115,
                    backgroundColor: t.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 6,
                  })}
                >
                  <Text style={{ color: t.onPrimary, fontSize: 68, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                    {seq.count}
                  </Text>
                  <Text style={{ color: t.onPrimary, opacity: 0.85, fontSize: 13, fontWeight: '700' }}>
                    target {seq.target}
                  </Text>
                </Pressable>
                <View style={{ width: '78%', marginTop: Spacing.lg }}>
                  <Progress value={seq.count} max={seq.target} />
                  <Text style={{ color: t.sub, fontSize: 11, marginTop: 6, textAlign: 'center' }}>
                    {seq.count} of {seq.target} · tap to count
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Targets */}
          <SectionTitle>Target</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            {TARGET_CHOICES.map((n) => (
              <Chip key={n} small label={`${n}`} selected={seq.target === n} onPress={() => updateProgress({ tasbeehSeq: setTarget(seq, n) })} />
            ))}
            <Chip
              small
              label="Custom…"
              selected={!TARGET_CHOICES.includes(seq.target)}
              onPress={() => {
                setCustomTarget(String(seq.target));
                setShowCustomTarget((v) => !v);
              }}
            />
          </View>
          {showCustomTarget && (
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
              <TextInput
                value={customTarget}
                onChangeText={setCustomTarget}
                keyboardType="number-pad"
                placeholder="e.g. 50"
                placeholderTextColor={t.sub}
                style={{ ...inputStyle(t), flex: 1 }}
              />
              <Pressable
                onPress={() => {
                  const n = parseInt(customTarget, 10);
                  if (!Number.isFinite(n) || n < 1) {
                    Alert.alert('Custom target', 'Please enter a positive number.');
                    return;
                  }
                  updateProgress({ tasbeehSeq: setTarget(seq, n) });
                  setShowCustomTarget(false);
                }}
                style={{ ...btnStyle(t), backgroundColor: t.gold, borderColor: t.gold, justifyContent: 'center' }}
              >
                <Text style={{ color: '#12251C', fontWeight: '800', fontSize: 12 }}>Set target</Text>
              </Pressable>
            </View>
          )}

          {/* Session controls */}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
            <Pressable onPress={confirmResetSession} style={btnStyle(t)}>
              <Icon name="repeat" size={15} color={t.text} />
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 12 }}>Reset session</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert('Restart cycle?', 'Counters and completed marks will be cleared for a fresh cycle.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Restart', onPress: () => updateProgress({ tasbeehSeq: startNextCycle(seq) }) },
                ])
              }
              style={btnStyle(t)}
            >
              <Icon name="play" size={15} color={t.text} />
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 12 }}>Restart cycle</Text>
            </Pressable>
          </View>

          {/* Daily stats */}
          <SectionTitle>Today</SectionTitle>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: t.gold, fontSize: 26, fontWeight: '900' }}>{dayTotal}</Text>
                <Sub>Counts today</Sub>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: t.gold, fontSize: 26, fontWeight: '900' }}>{stats.cycles}</Text>
                <Sub>Cycles today</Sub>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: t.gold, fontSize: 26, fontWeight: '900' }}>{seq.cycles}</Text>
                <Sub>Cycles all-time</Sub>
              </View>
            </View>
          </Card>

          {/* Vibration */}
          <SectionTitle>Vibration</SectionTitle>
          <Card>
            <Toggle
              label="Vibration enabled"
              value={settings.vibrateEnabled}
              onChange={(v) => updateSettings({ vibrateEnabled: v })}
            />
            <Divider />
            <Toggle
              label="Short vibration on each count"
              value={settings.vibrateOnCount}
              onChange={(v) => updateSettings({ vibrateOnCount: v })}
            />
            <Divider />
            <Toggle
              label="Distinct vibration at the target"
              value={settings.vibrateOnTarget}
              onChange={(v) => updateSettings({ vibrateOnTarget: v })}
            />
            <Sub style={{ marginTop: Spacing.sm }}>
              Quiet by default — no sound is played. Device vibration settings are respected.
            </Sub>
          </Card>
        </>
      )}

      {mode === 'free' && (
        <>
          <SectionTitle>Dhikr</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            {TASBEEH_PRESETS.map((p) => (
              <Chip
                key={p.ar}
                small
                label={p.label}
                selected={p.ar === presetAr}
                onPress={() => {
                  updateProgress({ tasbeeh: { count: 0, total, preset: p.ar } });
                  setPresetAr(p.ar);
                }}
              />
            ))}
          </View>

          <View style={{ alignItems: 'center', marginTop: Spacing.xl }}>
            <Text style={{ ...arabicStyle(30, t.gold, true), marginBottom: Spacing.lg }}>{presetAr}</Text>
            <Pressable
              onPress={tapFree}
              style={({ pressed }) => ({
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: t.primary,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.97 : 1 }],
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
              })}
            >
              <Text style={{ color: t.onPrimary, fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                {freeCount}
              </Text>
              <Text style={{ color: t.onPrimary, opacity: 0.85, fontSize: 13, fontWeight: '700' }}>
                target {preset.target}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl }}>
              <Pressable
                onPress={() => updateProgress({ tasbeeh: { count: 0, total, preset: presetAr } })}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, borderRadius: Radius.pill, borderWidth: 1, borderColor: t.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}
              >
                <Icon name="repeat" size={17} color={t.text} />
                <Text style={{ color: t.text, fontWeight: '700', marginLeft: 8 }}>Reset counter</Text>
              </Pressable>
            </View>
          </View>

          <SectionTitle>Lifetime</SectionTitle>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: t.gold, fontSize: 28, fontWeight: '900' }}>{total}</Text>
                <Sub>Total tasbeeh</Sub>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: t.gold, fontSize: 28, fontWeight: '900' }}>{Math.floor(total / preset.target)}</Text>
                <Sub>Completed rounds</Sub>
              </View>
            </View>
          </Card>
        </>
      )}

      <View style={{ height: Spacing.xl }} />
    </Screen>
  );
}

const inputStyle = (t: ReturnType<typeof useTheme>) => ({
  backgroundColor: t.bg,
  borderWidth: 1,
  borderColor: t.border,
  borderRadius: Radius.md,
  color: t.text,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.sm,
  fontSize: 13,
  marginTop: 6,
});

const btnStyle = (t: ReturnType<typeof useTheme>) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 7,
  backgroundColor: t.card,
  borderRadius: Radius.pill,
  borderWidth: 1,
  borderColor: t.border,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
});
