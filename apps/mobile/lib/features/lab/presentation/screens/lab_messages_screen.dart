import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class LabMessageThread {
  final String id;
  final String senderName;
  final String senderRole;
  final String avatarUrl;
  final String lastMessage;
  final String time;
  final int unreadCount;
  final bool isStat;

  const LabMessageThread({
    required this.id,
    required this.senderName,
    required this.senderRole,
    required this.avatarUrl,
    required this.lastMessage,
    required this.time,
    this.unreadCount = 0,
    this.isStat = false,
  });
}

class LabChatMessage {
  final String text;
  final bool isFromMe;
  final String time;
  final bool isStatAlert;

  const LabChatMessage({
    required this.text,
    required this.isFromMe,
    required this.time,
    this.isStatAlert = false,
  });
}

class LabMessagesScreen extends StatefulWidget {
  const LabMessagesScreen({super.key});

  @override
  State<LabMessagesScreen> createState() => _LabMessagesScreenState();
}

class _LabMessagesScreenState extends State<LabMessagesScreen> {
  LabMessageThread? _activeThread;
  final _msgController = TextEditingController();

  final List<LabMessageThread> _threads = [
    const LabMessageThread(
      id: 'th-1',
      senderName: 'Dr. Tesfaye Alemu',
      senderRole: 'Internal Medicine (Attending)',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
      lastMessage: 'Received critical Hb 6.4 g/dL alert for Aster Mulu. 2 units PRBC ordered.',
      time: '08:42 AM',
      unreadCount: 1,
      isStat: true,
    ),
    const LabMessageThread(
      id: 'th-2',
      senderName: 'Sister Tigist Alemu',
      senderRole: 'Emergency Ward Charge Nurse',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813572-9111b18d2d99?w=150',
      lastMessage: 'Sample for Kebede Chala (Blood culture bottle 1 & 2) sent via pneumatic tube.',
      time: '08:15 AM',
      unreadCount: 0,
    ),
    const LabMessageThread(
      id: 'th-3',
      senderName: 'Dr. Hanna Girma',
      senderRole: 'Endocrinology Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      lastMessage: 'Is Abebe Assefa Fasting Blood Sugar or Random? Please check collection slip.',
      time: '09:20 AM',
      unreadCount: 2,
    ),
    const LabMessageThread(
      id: 'th-4',
      senderName: 'Nurse Almaz Bekele',
      senderRole: 'Inpatient Ward 2-B',
      avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150',
      lastMessage: 'Understood. We are redrawing the hemolyzed gold-top tube right now.',
      time: '10:05 AM',
      unreadCount: 0,
    ),
  ];

  late final Map<String, List<LabChatMessage>> _chatHistories = {
    'th-1': [
      const LabChatMessage(
        text: 'CRITICAL VALUE ALERT: Patient Aster Mulu (PID-001024), Hb is 6.4 g/dL (Reference: 12.0 - 16.0 g/dL). Repeat analyzer run confirmed result.',
        isFromMe: true,
        time: '08:35 AM',
        isStatAlert: true,
      ),
      const LabChatMessage(
        text: 'Received and confirmed. Thank you Dawit. Patient is tachycardic, order for 2 units packed RBCs submitted to Blood Bank.',
        isFromMe: false,
        time: '08:42 AM',
      ),
    ],
    'th-2': [
      const LabChatMessage(
        text: 'Hello Lab, we drew aerobic and anaerobic blood cultures for Kebede Chala (PID-001092).',
        isFromMe: false,
        time: '08:10 AM',
      ),
      const LabChatMessage(
        text: 'Bottles received in lab and loaded into BACT/ALERT incubation system at 08:14 AM.',
        isFromMe: true,
        time: '08:15 AM',
      ),
    ],
    'th-3': [
      const LabChatMessage(
        text: 'Requisition indicates RBS (Random Blood Sugar) collected at 09:10 AM post breakfast.',
        isFromMe: true,
        time: '09:18 AM',
      ),
      const LabChatMessage(
        text: 'Is Abebe Assefa Fasting Blood Sugar or Random? Please check collection slip.',
        isFromMe: false,
        time: '09:20 AM',
      ),
    ],
    'th-4': [
      const LabChatMessage(
        text: 'Hi Nurse Almaz, sample SMP-2026-0024 for Tigist Alemu is 3+ hemolyzed. Potassium and LFT will be falsely elevated.',
        isFromMe: true,
        time: '09:58 AM',
      ),
      const LabChatMessage(
        text: 'Understood. We are redrawing the hemolyzed gold-top tube right now.',
        isFromMe: false,
        time: '10:05 AM',
      ),
    ],
  };

  @override
  void dispose() {
    _msgController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty || _activeThread == null) return;

    setState(() {
      _chatHistories[_activeThread!.id] ??= [];
      _chatHistories[_activeThread!.id]!.add(
        LabChatMessage(
          text: text,
          isFromMe: true,
          time: 'Just now',
        ),
      );
      _msgController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_activeThread != null) {
      return _buildConversationView(_activeThread!);
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Clinical Intercom & Messages',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _threads.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final thread = _threads[index];
          return _buildThreadCard(thread);
        },
      ),
    );
  }

  Widget _buildThreadCard(LabMessageThread thread) {
    return InkWell(
      onTap: () => setState(() => _activeThread = thread),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: thread.isStat ? const Color(0xFFFECDD3) : AppTheme.border,
            width: thread.isStat ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 24,
              backgroundImage: NetworkImage(thread.avatarUrl),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          thread.senderName,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        thread.time,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    thread.senderRole,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF06B6D4),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    thread.lastMessage,
                    style: TextStyle(
                      fontSize: 12,
                      color: thread.unreadCount > 0
                          ? const Color(0xFF0F172A)
                          : const Color(0xFF64748B),
                      fontWeight: thread.unreadCount > 0
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (thread.isStat) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'STAT',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ),
            ] else if (thread.unreadCount > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Color(0xFF06B6D4),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${thread.unreadCount}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildConversationView(LabMessageThread thread) {
    final messages = _chatHistories[thread.id] ?? [];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => setState(() => _activeThread = null),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(thread.avatarUrl),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    thread.senderName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    thread.senderRole,
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF06B6D4),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: Column(
        children: [
          // Quick Clinical Canned Responses
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _cannedPill('CRITICAL VALUE READBACK'),
                  _cannedPill('Specimen Received in Lab'),
                  _cannedPill('Redraw Hemolyzed Sample'),
                  _cannedPill('Results Released to EMR'),
                ],
              ),
            ),
          ),
          const Divider(height: 1),

          // Messages List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final msg = messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppTheme.border)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.emergency_outlined,
                        color: Color(0xFFEF4444)),
                    tooltip: 'Send STAT Panic Alert',
                    onPressed: () {
                      _msgController.text =
                          'CRITICAL ALERT: Specimen requires immediate physician review!';
                    },
                  ),
                  Expanded(
                    child: TextField(
                      controller: _msgController,
                      decoration: InputDecoration(
                        hintText: 'Type lab update or clinical reply...',
                        hintStyle: const TextStyle(
                            fontSize: 13, color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide(color: AppTheme.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide(color: AppTheme.border),
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFF06B6D4),
                    radius: 20,
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded,
                          color: Colors.white, size: 18),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _cannedPill(String text) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ActionChip(
        label: Text(
          text,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0284C7),
          ),
        ),
        backgroundColor: const Color(0xFFE0F2FE),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        onPressed: () {
          _msgController.text = text;
        },
      ),
    );
  }

  Widget _buildMessageBubble(LabChatMessage msg) {
    return Align(
      alignment: msg.isFromMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: const BoxConstraints(maxWidth: 290),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: msg.isStatAlert
              ? const Color(0xFFFEF2F2)
              : msg.isFromMe
                  ? const Color(0xFF06B6D4)
                  : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: msg.isStatAlert
                ? const Color(0xFFEF4444)
                : msg.isFromMe
                    ? const Color(0xFF06B6D4)
                    : AppTheme.border,
            width: msg.isStatAlert ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment:
              msg.isFromMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (msg.isStatAlert) ...[
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.warning_amber_rounded,
                      color: Color(0xFFEF4444), size: 14),
                  SizedBox(width: 4),
                  Text(
                    'CRITICAL PANIC VALUE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFEF4444),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
            ],
            Text(
              msg.text,
              style: TextStyle(
                fontSize: 13,
                color: msg.isStatAlert
                    ? const Color(0xFF991B1B)
                    : msg.isFromMe
                        ? Colors.white
                        : const Color(0xFF0F172A),
                fontWeight:
                    msg.isStatAlert ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              msg.time,
              style: TextStyle(
                fontSize: 10,
                color: msg.isFromMe
                    ? Colors.white.withValues(alpha: 0.8)
                    : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

