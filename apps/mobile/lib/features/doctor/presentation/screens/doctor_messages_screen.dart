import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/doctor_models.dart';
import '../../data/doctor_repository.dart';

class DoctorMessagesScreen extends ConsumerStatefulWidget {
  const DoctorMessagesScreen({super.key});

  @override
  ConsumerState<DoctorMessagesScreen> createState() =>
      _DoctorMessagesScreenState();
}

class _DoctorMessagesScreenState extends ConsumerState<DoctorMessagesScreen> {
  ConversationItem? _activeConversation;
  final _msgController = TextEditingController();

  @override
  void dispose() {
    _msgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(doctorProvider);
    final conversations = state.conversations;

    if (_activeConversation != null) {
      final current = conversations.firstWhere(
        (c) => c.id == _activeConversation!.id,
        orElse: () => _activeConversation!,
      );

      return Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded,
                color: AppTheme.textPrimary),
            onPressed: () => setState(() => _activeConversation = null),
          ),
          title: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  image: DecorationImage(
                    image: NetworkImage(current.avatar),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    current.name,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    current.role,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
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
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: current.messages.length,
                itemBuilder: (context, index) {
                  final msg = current.messages[index];
                  final isMe = msg.isMe;

                  return Align(
                    alignment:
                        isMe ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.75,
                      ),
                      decoration: BoxDecoration(
                        color:
                            isMe ? const Color(0xFF1E6BFF) : Colors.white,
                        borderRadius: BorderRadius.circular(16).copyWith(
                          bottomRight: isMe
                              ? const Radius.circular(2)
                              : const Radius.circular(16),
                          bottomLeft: !isMe
                              ? const Radius.circular(2)
                              : const Radius.circular(16),
                        ),
                        border: isMe
                            ? null
                            : Border.all(color: AppTheme.border, width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: isMe
                            ? CrossAxisAlignment.end
                            : CrossAxisAlignment.start,
                        children: [
                          Text(
                            msg.text,
                            style: TextStyle(
                              fontSize: 13,
                              color: isMe
                                  ? Colors.white
                                  : AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            msg.time,
                            style: TextStyle(
                              fontSize: 9.5,
                              color: isMe
                                  ? Colors.white.withValues(alpha: 0.75)
                                  : const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: SafeArea(
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _msgController,
                        decoration: InputDecoration(
                          hintText: 'Type a message...',
                          hintStyle: const TextStyle(
                              fontSize: 13, color: Color(0xFF94A3B8)),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: const BorderSide(color: AppTheme.border),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: const BorderSide(color: AppTheme.border),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    CircleAvatar(
                      backgroundColor: const Color(0xFF1E6BFF),
                      radius: 22,
                      child: IconButton(
                        icon: const Icon(Icons.send_rounded,
                            color: Colors.white, size: 18),
                        onPressed: () {
                          final text = _msgController.text.trim();
                          if (text.isNotEmpty) {
                            ref
                                .read(doctorProvider.notifier)
                                .sendMessage(current.id, text);
                            _msgController.clear();
                          }
                        },
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

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Messages'),
        elevation: 0,
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppTheme.border, height: 1),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: conversations.length,
        itemBuilder: (context, index) {
          final c = conversations[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              leading: Stack(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: DecorationImage(
                        image: NetworkImage(c.avatar),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  if (c.unreadCount > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                ],
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    c.name,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    c.time,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  c.lastMessage,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight:
                        c.unreadCount > 0 ? FontWeight.w600 : FontWeight.w400,
                    color: c.unreadCount > 0
                        ? AppTheme.textPrimary
                        : const Color(0xFF64748B),
                  ),
                ),
              ),
              onTap: () => setState(() => _activeConversation = c),
            ),
          );
        },
      ),
    );
  }
}
