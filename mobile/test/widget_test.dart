import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:zyptos_mobile/main.dart';

void main() {
  testWidgets('shows Zyptos login screen', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const ZyptosMobileApp());
    await tester.pumpAndSettle();

    expect(find.text('Zyptos'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
    expect(find.text('Continue'), findsOneWidget);
  });
}
