import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'firebase_options.dart';

part 'constants.dart';
part 'config/api_client.dart';
part 'config/session.dart';
part 'theme/colors.dart';
part 'theme/theme.dart';
part 'translations/en.dart';
part 'app.dart';
part 'features/auth/screens/login_screen.dart';
part 'features/workspace/screens/workspace_shell.dart';
part 'features/inbox/screens/inbox_screen.dart';
part 'features/calls/screens/calls_screen.dart';
part 'features/contacts/screens/contacts_screen.dart';
part 'features/leads/screens/leads_screen.dart';
part 'features/integrations/screens/integrations_screen.dart';
part 'features/tools/screens/tools_screen.dart';
part 'features/notifications/screens/notifications_screen.dart';
part 'features/account/screens/account_screen.dart';
part 'features/search/screens/mobile_search_delegate.dart';
part 'widgets/api_list_view.dart';
part 'widgets/brand_mark.dart';
part 'widgets/metrics.dart';
part 'widgets/section_title.dart';
part 'widgets/search_box.dart';
part 'widgets/filter_chips.dart';
part 'features/inbox/widgets/conversation_tile.dart';
part 'features/inbox/screens/conversation_detail_screen.dart';
part 'features/inbox/widgets/quick_reply_sheet.dart';
part 'widgets/info_card.dart';
part 'widgets/detail_sheet.dart';
part 'widgets/feedback.dart';
part 'utils/formatters.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (_) {
    // Keep the app usable in test/dev environments where Firebase is unavailable.
  }
  runApp(const ZyptosMobileApp());
}
