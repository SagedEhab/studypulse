"""Generates the StudyPulse Phase 1 UML diagrams as SVG files (use case, activity, data model)."""
import math
import sys
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

INK = '#1E293B'
MUTED = '#475569'
ACCENT = '#4338CA'
FILL = '#EEF2FF'
FILL2 = '#F8FAFC'
FONT = "'Segoe UI', Arial, sans-serif"


def text_w(s, size, factor=0.53):
    return len(s) * size * factor


def svg_doc(w, h, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="{FONT}">
<defs>
  <marker id="open" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
    <path d="M1,1 L13,7 L1,13" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"/>
  </marker>
</defs>
<rect width="{w}" height="{h}" fill="#FFFFFF"/>
{body}
</svg>'''


def text(x, y, s, size=18, weight='normal', anchor='middle', color=INK, italic=False, extra=''):
    style = ' font-style="italic"' if italic else ''
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" '
        f'fill="{color}"{style}{extra}>{escape(s)}</text>'
    )


def multiline(x, cy, lines, size=18, weight='normal', color=INK, gap=1.25, italic=False):
    """Vertically centred block of lines around cy."""
    out = []
    lh = size * gap
    top = cy - (len(lines) - 1) * lh / 2
    for i, line_ in enumerate(lines):
        out.append(text(x, top + i * lh + size * 0.35, line_, size, weight, 'middle', color, italic))
    return ''.join(out)


def label_box(x, y, lines, size=15):
    """A white-backed relationship label: stereotype, then an optional [condition] in italics."""
    lh = size * 1.25
    w = max(text_w(l, size, 0.52) for l in lines) + 10
    h = lh * len(lines) + 4
    out = [f'<rect x="{x - w / 2:.1f}" y="{y - h / 2:.1f}" width="{w:.1f}" height="{h:.1f}" fill="#FFFFFF"/>']
    top = y - (len(lines) - 1) * lh / 2
    for i, line_ in enumerate(lines):
        out.append(text(x, top + i * lh + size * 0.35, line_, size, 'normal', 'middle', INK, italic=i >= 1))
    return ''.join(out)


def line(x1, y1, x2, y2, dashed=False, arrow=False, width=1.8):
    dash = ' stroke-dasharray="8 6"' if dashed else ''
    marker = ' marker-end="url(#open)"' if arrow else ''
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{INK}" stroke-width="{width}"{dash}{marker}/>'


def poly(points, arrow=True):
    d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in points)
    marker = ' marker-end="url(#open)"' if arrow else ''
    return f'<polyline points="{d}" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"{marker}/>'


# ---------------------------------------------------------------- use case diagram

def ellipse_edge(cx, cy, rx, ry, tx, ty):
    dx, dy = tx - cx, ty - cy
    t = 1 / math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
    return cx + dx * t, cy + dy * t


def actor(x, y, name_lines):
    """Stick figure; (x, y) is the hip."""
    return ''.join([
        f'<circle cx="{x}" cy="{y - 58}" r="15" fill="#FFFFFF" stroke="{INK}" stroke-width="2"/>',
        line(x, y - 43, x, y, width=2),
        line(x - 28, y - 28, x + 28, y - 28, width=2),
        line(x, y, x - 24, y + 38, width=2),
        line(x, y, x + 24, y + 38, width=2),
        multiline(x, y + 68 + (len(name_lines) - 1) * 11, name_lines, 18, 'bold'),
    ])


def use_case_diagram():
    W, H = 1090, 905
    body = []
    body.append(f'<rect x="150" y="20" width="760" height="865" rx="6" fill="{FILL2}" stroke="{INK}" stroke-width="2"/>')
    body.append(text(172, 54, 'StudyPulse', 24, 'bold', 'start'))

    BX, BRX = 310, 132  # base use cases (left column)
    HX, HRX = 742, 150  # supporting use cases (right column)
    RY = 40
    base = {
        'UC1': ('View Today Dashboard', 'UC1 · FR6', 115),
        'UC2': ('Browse Tasks', 'UC2 · FR5', 235),
        'UC3': ('Add / Edit Task', 'UC3 · FR1, FR3', 455),
        'UC4': ('Delete Task', 'UC4 · FR3', 685),
        'UC5': ('Mark Task Done', 'UC5 · FR4', 825),
    }
    helper = {
        'search': ('Search / Filter Tasks', 'FR5', 235),
        'export': ('Export to Google Calendar', 'FR8', 350),
        'validate': ('Validate Task Details', 'FR2', 455),
        'schedule': ('Schedule Reminder', 'FR7', 560),
        'confirm': ('Confirm Deletion', 'FR3', 685),
        'cancel': ('Cancel Reminder', 'FR7', 825),
    }

    def draw_uc(cx, cy, rx, name, tag, fill):
        return (
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{RY}" fill="{fill}" stroke="{INK}" stroke-width="2"/>'
            + text(cx, cy - 2, name, 18, '600')
            + text(cx, cy + 20, tag, 14, '600', 'middle', ACCENT)
        )

    # Student: associations meet each use case at its leftmost point, so no line crosses another ellipse.
    sx, sy = 70, 470
    body.append(actor(sx, sy, ['Student']))
    hand = (sx + 30, sy - 28)
    for name, tag, y in base.values():
        body.append(line(hand[0], hand[1], BX - BRX, y))

    # secondary actors, outside the boundary
    gx, gy = 1000, 350 + 28
    nx, ny = 1000, 692 + 28
    body.append(actor(gx, gy, ['Google', 'Calendar API']))
    body.append(actor(nx, ny, ['Notification', 'Service']))
    for (ax, ay), key in [((gx, gy), 'export'), ((nx, ny), 'schedule'), ((nx, ny), 'cancel')]:
        _, _, y = helper[key]
        hx, hy = ax - 30, ay - 28
        ex, ey = ellipse_edge(HX, y, HRX, RY, hx, hy)
        body.append(line(hx, hy, ex, ey))

    # include / extend: dashed, open arrow from source to target
    rels = [
        ('search', 'UC2', 'extend', '[filter used]'),
        ('export', 'UC3', 'extend', '[on request]'),
        ('UC3', 'validate', 'include', None),
        ('schedule', 'UC3', 'extend', '[reminder set]'),
        ('UC4', 'confirm', 'include', None),
        ('cancel', 'UC4', 'extend', '[had reminder]'),
        ('cancel', 'UC5', 'extend', '[had reminder]'),
    ]

    def geom(key):
        if key in base:
            return BX, base[key][2], BRX
        return HX, helper[key][2], HRX

    labels = []
    for src, dst, kind, cond in rels:
        sx1, sy1, srx = geom(src)
        dx1, dy1, drx = geom(dst)
        p1 = ellipse_edge(sx1, sy1, srx, RY, dx1, dy1)
        p2 = ellipse_edge(dx1, dy1, drx, RY, sx1, sy1)
        body.append(line(p1[0], p1[1], p2[0], p2[1], dashed=True, arrow=True))
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        labels.append(label_box(mx, my, [f'«{kind}»'] + ([cond] if cond else [])))

    for name, tag, y in base.values():
        body.append(draw_uc(BX, y, BRX, name, tag, '#FFFFFF'))
    for name, tag, y in helper.values():
        body.append(draw_uc(HX, y, HRX, name, tag, FILL))
    body.extend(labels)

    (OUT / 'use-case-diagram.svg').write_text(svg_doc(W, H, '\n'.join(body)), encoding='utf-8')


# ---------------------------------------------------------------- activity diagram

def action(cx, cy, w, lines_, h=None):
    h = h or (46 if len(lines_) == 1 else 62)
    return (
        f'<rect x="{cx - w / 2:.1f}" y="{cy - h / 2:.1f}" width="{w}" height="{h}" rx="20" fill="{FILL}" stroke="{INK}" stroke-width="2"/>'
        + multiline(cx, cy, lines_, 17, '600')
    ), h


def diamond(cx, cy, r=22):
    return f'<polygon points="{cx},{cy - r} {cx + r},{cy} {cx},{cy + r} {cx - r},{cy}" fill="#FFFFFF" stroke="{INK}" stroke-width="2"/>'


def guard(x, y, s):
    w = text_w(s, 15, 0.5) + 8
    return (
        f'<rect x="{x - w / 2:.1f}" y="{y - 11:.1f}" width="{w:.1f}" height="20" fill="#FFFFFF"/>'
        + text(x, y + 4, s, 15, 'normal', 'middle', MUTED, italic=True)
    )


def activity_diagram():
    W, H = 1080, 1690
    b = []
    X = 540  # main spine

    b.append(f'<circle cx="{X}" cy="30" r="13" fill="{INK}"/>')  # initial node
    s, h_open = action(X, 92, 220, ['Open StudyPulse'])
    b.append(s)
    b.append(line(X, 43, X, 92 - h_open / 2, arrow=True))

    M0 = 160  # merge: first load and every retry
    b.append(line(X, 92 + h_open / 2, X, M0 - 20, arrow=True))
    b.append(diamond(X, M0, 20))
    s, h_load = action(X, 228, 330, ['Load saved tasks from the phone'])
    b.append(s)
    b.append(line(X, M0 + 20, X, 228 - h_load / 2, arrow=True))

    D1 = 305
    b.append(line(X, 228 + h_load / 2, X, D1 - 22, arrow=True))
    b.append(diamond(X, D1))
    s, h_err = action(250, D1, 230, ['Show an error and', 'a Try again button'])
    b.append(s)
    b.append(line(X - 22, D1, 250 + 115, D1, arrow=True))
    b.append(guard((X - 22 + 365) / 2, D1 - 16, '[load failed]'))
    b.append(poly([(250, D1 - h_err / 2), (250, M0), (X - 20, M0)]))

    s, h_dash = action(X, 385, 260, ['Show Today dashboard'])
    b.append(s)
    b.append(line(X, D1 + 22, X, 385 - h_dash / 2, arrow=True))
    b.append(guard(X + 46, D1 + 40, '[loaded]'))

    M1 = 460  # merge: every branch comes back here
    b.append(line(X, 385 + h_dash / 2, X, M1 - 20, arrow=True))
    b.append(diamond(X, M1, 20))
    s, h_choose = action(X, 530, 230, ['Choose what to do'])
    b.append(s)
    b.append(line(X, M1 + 20, X, 530 - h_choose / 2, arrow=True))

    D2 = 610
    b.append(line(X, 530 + h_choose / 2, X, D2 - 24, arrow=True))
    b.append(diamond(X, D2, 24))
    FX = 1010  # final node
    b.append(line(X + 24, D2, FX - 17, D2, arrow=True))
    b.append(guard(860, D2 - 16, '[close app]'))
    b.append(f'<circle cx="{FX}" cy="{D2}" r="16" fill="#FFFFFF" stroke="{INK}" stroke-width="2.2"/>')
    b.append(f'<circle cx="{FX}" cy="{D2}" r="9" fill="{INK}"/>')

    TOP = 740
    C1, C2, C3, C4, CE = 120, 330, 540, 780, 985
    start = (X, D2 + 24)

    s, h1 = action(C1, TOP, 180, ['Show task list'])
    b.append(s)
    b.append(line(*start, C1, TOP - h1 / 2, arrow=True))
    b.append(guard(215, 690, '[view tasks]'))
    s, h2 = action(C2, TOP, 180, ['Mark task', 'done / not done'])
    b.append(s)
    b.append(line(*start, C2, TOP - h2 / 2, arrow=True))
    b.append(guard(395, 686, '[mark done]'))
    s, h3 = action(C3, TOP, 190, ['Ask to confirm'])
    b.append(s)
    b.append(line(*start, C3, TOP - h3 / 2, arrow=True))
    b.append(guard(C3 + 40, 670, '[delete]'))
    MF = 705  # merge before the form (new entry + every failed validation)
    b.append(line(*start, C4, MF - 20, arrow=True))
    b.append(guard(690, 650, '[add / edit]'))

    # browse
    D3 = 825
    b.append(line(C1, TOP + h1 / 2, C1, D3 - 22, arrow=True))
    b.append(diamond(C1, D3))
    s, h_apply = action(C1, 915, 180, ['Apply search', 'and filters'])
    b.append(s)
    b.append(line(C1, D3 + 22, C1, 915 - h_apply / 2, arrow=True))
    b.append(guard(C1 - 2, D3 + 44, '[search / filter]'))
    MC1 = 1000
    b.append(line(C1, 915 + h_apply / 2, C1, MC1 - 18, arrow=True))
    b.append(diamond(C1, MC1, 18))
    b.append(poly([(C1 + 22, D3), (226, D3), (226, MC1), (C1 + 18, MC1)]))
    b.append(guard(186, D3 - 15, '[no filter]'))

    # mark done
    s, h_prog = action(C2, 835, 180, ['Update weekly', 'progress'])
    b.append(s)
    b.append(line(C2, TOP + h2 / 2, C2, 835 - h_prog / 2, arrow=True))

    # delete
    D4 = 825
    b.append(line(C3, TOP + h3 / 2, C3, D4 - 22, arrow=True))
    b.append(diamond(C3, D4))
    s, h_del = action(C3, 915, 190, ['Delete the task', 'and its reminder'])
    b.append(s)
    b.append(line(C3, D4 + 22, C3, 915 - h_del / 2, arrow=True))
    b.append(guard(C3 - 2, D4 + 44, '[confirmed]'))
    MC3 = 1000
    b.append(line(C3, 915 + h_del / 2, C3, MC3 - 18, arrow=True))
    b.append(diamond(C3, MC3, 18))
    b.append(poly([(C3 + 22, D4), (652, D4), (652, MC3), (C3 + 18, MC3)]))
    b.append(guard(600, D4 - 15, '[cancelled]'))

    # add / edit
    b.append(diamond(C4, MF, 20))
    s, h_enter = action(C4, 790, 230, ['Enter or change', 'the task details'])
    b.append(s)
    b.append(line(C4, MF + 20, C4, 790 - h_enter / 2, arrow=True))
    s, h_val = action(C4, 875, 230, ['Validate the details'])
    b.append(s)
    b.append(line(C4, 790 + h_enter / 2, C4, 875 - h_val / 2, arrow=True))
    D5 = 950
    b.append(line(C4, 875 + h_val / 2, C4, D5 - 22, arrow=True))
    b.append(diamond(C4, D5))
    s, _ = action(CE, D5, 150, ['Show a message', 'under each', 'invalid field'], h=86)
    b.append(s)
    b.append(line(C4 + 22, D5, CE - 75, D5, arrow=True))
    b.append(guard(860, D5 - 15, '[invalid]'))
    b.append(poly([(CE, D5 - 43), (CE, MF), (C4 + 20, MF)]))
    s, h_save = action(C4, 1035, 230, ['Save the task', 'on the phone'])
    b.append(s)
    b.append(line(C4, D5 + 22, C4, 1035 - h_save / 2, arrow=True))
    b.append(guard(C4 + 38, D5 + 40, '[valid]'))
    D6 = 1120
    b.append(line(C4, 1035 + h_save / 2, C4, D6 - 22, arrow=True))
    b.append(diamond(C4, D6))
    s, h_sched = action(C4, 1205, 230, ['Schedule the', 'reminder notification'])
    b.append(s)
    b.append(line(C4, D6 + 22, C4, 1205 - h_sched / 2, arrow=True))
    b.append(guard(C4 - 2, D6 + 44, '[reminder chosen]'))
    MR = 1290
    b.append(line(C4, 1205 + h_sched / 2, C4, MR - 18, arrow=True))
    b.append(diamond(C4, MR, 18))
    b.append(poly([(C4 + 22, D6), (918, D6), (918, MR), (C4 + 18, MR)]))
    b.append(guard(868, D6 - 15, '[no reminder]'))
    D7 = 1365
    b.append(line(C4, MR + 18, C4, D7 - 22, arrow=True))
    b.append(diamond(C4, D7))
    s, h_exp = action(C4, 1450, 230, ['Add the event to', 'Google Calendar'])
    b.append(s)
    b.append(line(C4, D7 + 22, C4, 1450 - h_exp / 2, arrow=True))
    b.append(guard(C4 - 2, D7 + 44, '[export requested]'))
    ME = 1535
    b.append(line(C4, 1450 + h_exp / 2, C4, ME - 18, arrow=True))
    b.append(diamond(C4, ME, 18))
    b.append(poly([(C4 + 22, D7), (918, D7), (918, ME), (C4 + 18, ME)]))
    b.append(guard(868, D7 - 15, '[no export]'))

    # every branch meets at one merge, which loops back to the hub merge M1
    MB = 1595
    b.append(diamond(X, MB, 20))
    b.append(poly([(C1, MC1 + 18), (C1, 1555), (X - 12, MB - 8)]))
    b.append(poly([(C2, 835 + h_prog / 2), (C2, 1550), (X - 6, MB - 14)]))
    b.append(poly([(C3, MC3 + 18), (C3, MB - 20)]))
    b.append(poly([(C4, ME + 18), (C4, 1555), (X + 12, MB - 8)]))
    b.append(poly([(X, MB + 20), (X, MB + 50), (22, MB + 50), (22, M1), (X - 20, M1)]))
    b.append(text(44, 1420, 'back to the dashboard', 14, 'normal', 'start', MUTED, italic=True,
                  extra=' transform="rotate(-90 44 1420)"'))

    (OUT / 'activity-diagram.svg').write_text(svg_doc(W, H, '\n'.join(b)), encoding='utf-8')


# ---------------------------------------------------------------- data model

def class_box(x, y, w, title, stereo, rows):
    head = 58
    row_h = 26
    h = head + 12 + row_h * len(rows)
    out = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#FFFFFF" stroke="{INK}" stroke-width="2"/>',
        f'<rect x="{x}" y="{y}" width="{w}" height="{head}" fill="{FILL}" stroke="{INK}" stroke-width="2"/>',
        text(x + w / 2, y + 22, stereo, 14, 'normal', 'middle', MUTED, italic=True),
        text(x + w / 2, y + 46, title, 19, 'bold'),
    ]
    for i, (name, typ) in enumerate(rows):
        ty = y + head + 8 + row_h * i + 18
        type_part = f'<tspan fill="{MUTED}" font-weight="normal">: {escape(typ)}</tspan>' if typ else ''
        out.append(
            f'<text x="{x + 14}" y="{ty}" font-size="16" text-anchor="start">'
            f'<tspan fill="{INK}" font-weight="600">{escape(name)}</tspan>{type_part}</text>'
        )
    return ''.join(out), h


def data_model():
    W, H = 1060, 640
    b = []
    task, th = class_box(40, 30, 420, 'Task', '«AsyncStorage · phone»', [
        ('id', 'string  {PK}'),
        ('title', 'string'),
        ('course', 'string'),
        ('type', 'TaskType'),
        ('priority', 'Priority'),
        ('dueDate', 'string  (YYYY-MM-DD)'),
        ('dueTime', "string  (HH:MM or '')"),
        ('reminderMinutes', 'number | null'),
        ('notes', 'string'),
        ('done', 'boolean'),
        ('createdAt', 'string  (ISO date-time)'),
    ])
    b.append(task)
    rem, _ = class_box(620, 30, 400, 'ScheduledReminder', '«AsyncStorage · Phase 2»', [
        ('taskId', 'string  {FK → Task.id}'),
        ('notificationId', 'string'),
        ('fireAt', 'string  (ISO date-time)'),
    ])
    b.append(rem)
    cal, _ = class_box(620, 235, 400, 'CalendarExport', '«AsyncStorage + Google Calendar · Phase 2»', [
        ('taskId', 'string  {FK → Task.id}'),
        ('googleEventId', 'string'),
        ('exportedAt', 'string  (ISO date-time)'),
    ])
    b.append(cal)
    st, _ = class_box(620, 440, 400, 'Settings', '«AsyncStorage · phone»', [
        ('defaultReminderMinutes', 'number | null'),
        ('notificationsAllowed', 'boolean'),
        ('googleAccountEmail', 'string | null'),
    ])
    b.append(st)
    e1, _ = class_box(40, 460, 190, 'TaskType', '«enumeration»', [('assignment', ''), ('exam', ''), ('study', '')])
    b.append(e1)
    e2, _ = class_box(270, 460, 190, 'Priority', '«enumeration»', [('low', ''), ('medium', ''), ('high', '')])
    b.append(e2)

    def assoc(x1, y1, x2, y2, m1, m2, name):
        return ''.join([
            line(x1, y1, x2, y2),
            text(x1 + 14, y1 - 10, m1, 17, 'bold', 'start'),
            text(x2 - 14, y2 - 10, m2, 17, 'bold', 'end'),
            text((x1 + x2) / 2, (y1 + y2) / 2 + 24, name, 15, 'normal', 'middle', MUTED, italic=True),
        ])

    b.append(assoc(460, 100, 620, 100, '1', '0..1', 'has'))
    b.append(assoc(460, 305, 620, 305, '1', '0..1', 'exported as'))
    b.append(line(135, 30 + th, 135, 460, dashed=True, arrow=True))
    b.append(line(365, 30 + th, 365, 460, dashed=True, arrow=True))
    b.append(text(145, 30 + th + 28, '«use»', 14, 'normal', 'start', MUTED, italic=True))
    b.append(text(375, 30 + th + 28, '«use»', 14, 'normal', 'start', MUTED, italic=True))

    (OUT / 'data-model.svg').write_text(svg_doc(W, H, '\n'.join(b)), encoding='utf-8')


# ---------------------------------------------------------------- architecture

def layer(x, y, w, h, title, detail, dashed=False, fill=FILL):
    dash = ' stroke-dasharray="8 6"' if dashed else ''
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{INK}" stroke-width="2"{dash}/>']
    out.append(text(x + 18, y + 30, title, 18, 'bold', 'start'))
    for i, d in enumerate(detail):
        out.append(text(x + 18, y + 56 + i * 22, d, 15, 'normal', 'start', MUTED))
    return ''.join(out)


def architecture():
    W, H = 1060, 700
    b = []
    LX, LW, LH, GAP = 40, 580, 84, 30
    stack = [
        ('Routes · src/app (Expo Router)', ['_layout.tsx (Stack + TasksProvider) · (tabs)/index · (tabs)/tasks · task/form']),
        ('Screens · features/tasks/screens', ['DashboardScreen · TaskListScreen · TaskFormScreen (+ TaskCard, TaskSection)']),
        ('Hooks · features/tasks/hooks', ['useTasks(): tasks + actions · useTaskForm(): form state and validation']),
        ('Provider · features/tasks/providers', ['TasksProvider (React Context): add · update · toggle · delete']),
        ('Repository · features/tasks/services', ['taskRepository.load() / save(): the only code that knows the storage']),
        ('Storage service · services/storage.ts', ['readJSON / writeJSON → AsyncStorage on the phone']),
    ]
    ys = []
    for i, (title, detail) in enumerate(stack):
        y = 24 + i * (LH + GAP)
        ys.append(y)
        b.append(layer(LX, y, LW, LH, title, detail, fill='#FFFFFF' if i == 0 else FILL))
        if i:
            b.append(line(LX + LW / 2, y - GAP, LX + LW / 2, y, arrow=True))

    RX, RW = 690, 330
    b.append(layer(RX, ys[0], RW, 120, 'Shared UI kit', ['components/ui: AppButton, Chip,', 'FormField, EmptyState, …', 'theme/tokens.ts'], fill=FILL2))
    b.append(layer(RX, ys[2] - 22, RW, 128, 'Pure logic (no React)', ['validation.ts: validateTask()', 'logic.ts: sort, filter, dashboard', 'dates.ts · types.ts · meta.ts'], fill=FILL2))
    b.append(layer(RX, ys[4] - 20, RW, 108, 'Phase 2 integrations', ['expo-notifications: reminders', 'Google Calendar API: export'], dashed=True, fill='#FFFFFF'))

    def use_arrow(x1, y1, x2, y2, label=None, at=0.5):
        parts = [line(x1, y1, x2, y2, dashed=True, arrow=True)]
        if label:
            parts.append(label_box(x1 + (x2 - x1) * at, y1 + (y2 - y1) * at - 2, [label], 14))
        return ''.join(parts)

    b.append(use_arrow(LX + LW, ys[1] + 30, RX, ys[0] + 70, '«use»'))
    b.append(use_arrow(LX + LW, ys[2] + 42, RX, ys[2] + 42, '«use»'))
    b.append(use_arrow(LX + LW, ys[3] + 42, RX, ys[4] + 34, '«use»', at=0.4))

    (OUT / 'architecture.svg').write_text(svg_doc(W, H, '\n'.join(b)), encoding='utf-8')


use_case_diagram()
activity_diagram()
data_model()
architecture()
print('written to', OUT)
