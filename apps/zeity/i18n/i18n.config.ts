export default defineI18nConfig(() => ({
  legacy: false,

  strategy: 'no_prefix',
  locales: [
    {
      code: 'de',
      name: 'Deutsch',
    },
    {
      code: 'en',
      name: 'English',
    },
  ],
  defaultLocale: 'en',
  fallbackLocale: 'en',

  messages: {
    en: {
      appName: 'Zeity',
      common: {
        actions: 'Actions',
        add: 'Add',
        all: 'All',
        back: 'Back',
        cancel: 'Cancel',
        close: 'Close',
        continue: 'Continue',
        copyToClipboard: 'Copy to clipboard',
        copiedToClipboard: 'Copied to clipboard',
        copyFailed: 'Copy failed',
        custom: 'Custom',
        delete: 'Delete',
        download: 'Download',
        edit: 'Edit',
        error: 'Error',
        general: 'General',
        loadMore: 'Load more',
        or: 'or',
        refresh: 'Refresh',
        save: 'Save',
        send: 'Send',
        start: 'Start',
        stop: 'Stop',
        success: 'Success',
        sync: 'Sync',
        upload: 'Upload',
        view: 'View',
      },
      navigation: {
        timer: 'Timer',
        projects: 'Projects',
        reports: 'Reports',
        settings: 'Settings',
        organisations: 'Organisations',
        login: 'Login',
        user: 'User',
        profile: 'Profile',
        about: 'About',
        more: 'More',
      },
      hints: {
        auth: {
          title: 'You are logged out',
          description:
            'Please log in to sync your data across devices and access all features of Zeity.',
          login: 'Login',
        },
        pwaInstall: {
          title: 'Install Zeity',
          description:
            'For a better experience, install Zeity on your device. It works offline and loads faster.',
          install: 'Install',
        },
        pwaRefresh: {
          title: 'Update Available',
          description:
            'A new version of Zeity is available. Please refresh the page to get the latest features and improvements.',
          refresh: 'Refresh',
        },
      },
      sync: {
        title: 'Sync',
        description:
          'You have offline {timeCount} times and {projectCount} projects that needs to be synced.',
        button: 'Sync Now',
        times: {
          successTitle: 'Times Synced',
          successMessage:
            '{n} of your time entries have been synced successfully.',
          errorTitle: 'Error Syncing Times',
          errorMessage:
            'There was an error syncing your time entries. Please try again.',
        },
        projects: {
          successTitle: 'Projects Synced',
          successMessage: '{n} of your projects have been synced successfully.',
          errorTitle: 'Error Syncing Projects',
          errorMessage:
            'There was an error syncing your projects. Please try again.',
        },
      },
      times: {
        title: 'Times',
        form: {
          startDate: 'Start Date',
          startTime: 'Start Time',
          endDate: 'End Date',
          endTime: 'End Time',
          project: 'Project',
          notes: 'Notes',
        },
        addNotes: 'Add notes',
        noProject: 'No project',
        offline: 'Time is not synced',
        dateFilter: 'Date',
        start: 'Start Time Tracker',
        stop: 'Stop Time Tracker',
        recordNext: 'Start Next Entry',
        round: 'Round Time',
        empty: {
          title: 'No Times',
          description:
            "It looks like you haven't tracked any time yet. Start tracking time by clicking the button below.",
          actions: {
            start: 'Start time tracker',
            stop: 'Stop time tracker',
            addTime: 'Add time',
          },
        },
        type: {
          manual: 'Manual',
          break: 'Break',
        },
        break: {
          notes: 'Break',
          start: 'Start Break',
          stop: 'Stop Break',
          continue: 'Continue Work',
        },
      },
      projects: {
        title: 'Projects',
        showClosed: 'closed projects',
        create: {
          title: 'Create Project',
        },
        edit: {
          title: 'Edit Project',
        },
        form: {
          name: 'Name',
          status: 'Status',
          notes: 'Notes',
        },
        status: {
          active: 'Active',
          closed: 'Closed',
        },
        noProjectNotes: 'No notes for this project',
        offline: 'Project is not synced',
        empty: {
          title: 'No Projects',
          description: 'You have no projects yet. Create one to get started.',
        },
      },
      reports: {
        summary: 'Summary',
        report: 'Report',
        downloadError: 'Error generating report',
        fields: {
          user: 'User',
          start: 'Start',
          duration: 'Duration',
          project: 'Project',
          notes: 'Notes',
          type: 'Record Type',
        },
      },
      settings: {
        title: 'Settings',
        general: 'General',
        language: 'Language',
        appearance: 'Appearance',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto',
        color: 'Color',
        data: 'Data',
        import: 'Import',
        export: 'Export',
        time: {
          title: 'Timer',
          detailsOnStart: 'Open details on start',
          detailsOnStop: 'Open details on stop',
          calculateBreaks: 'Calculate breaks',
          roundTimes: 'Round times automatically',
        },
      },
      offline: {
        title: 'Offline',
        description:
          'You are currently offline. Some features may be unavailable.',
      },
      organisations: {
        title: 'Organisations',
        create: 'Create Organisation',
        createSuccess: 'Organisation created successfully',
        createError: 'Error creating organisation',
        manage: 'Manage Organisation',
        updateSuccess: 'Organisation updated successfully',
        updateError: 'Error updating organisation',
        form: {
          name: 'Name',
          namePlaceholder: 'Enter organisation name',
        },
        empty: {
          title: 'No Organisations',
          description:
            'You are not a member of any organisations yet. Create or join one to collaborate with others.',
        },
        teams: {
          title: 'Teams',
          create: 'Create Team',
          createSuccess: 'Team created successfully',
          createError: 'Error creating team',
          updateSuccess: 'Team updated successfully',
          updateError: 'Error updating team',
          deleteSuccess: 'Team deleted successfully',
          deleteError: 'Error deleting team',
          count: 'No Teams|{n} Team|{n} Teams',
          form: {
            name: 'Name',
            namePlaceholder: 'Enter team name',
            description: 'Description',
            descriptionPlaceholder: 'Enter team description',
          },
          members: {
            title: 'Members',
            add: 'Add Member',
            addSuccess: 'Member added successfully',
            addError: 'Error adding member',
            delete: 'Remove Member',
            deleteSuccess: 'Member removed successfully',
            deleteError: 'Error removing member',
          },
        },
        members: {
          title: 'Members',
          count: 'No Members|{n} Member|{n} Members',
          role: {
            owner: 'Owner',
            admin: 'Admin',
            member: 'Member',
          },
          setRole: 'Set Role: {role}',
          roleUpdateSuccess: 'Role updated successfully',
          roleUpdateError: 'Error updating role',
          deleteSuccess: 'Member deleted successfully',
          deleteError: 'Error deleting member',
        },
        invites: {
          title: 'Invitations',
          create: 'Invite',
          createSuccess: 'Invitation sent successfully',
          createError: 'Error sending invitation',
          resend: 'Resend',
          resendSuccess: 'Invitation resent successfully',
          resendError: 'Error resending invitation',
          deleteSuccess: 'Invitation deleted successfully',
          deleteError: 'Error deleting invitation',
          empty: 'No pending invitations',
        },
        join: {
          title: 'Join Organisation',
          description: 'You have been invited to join {organisation}.',
          error: 'Error joining organisation',
          accept: 'Accept Invitation',
          acceptSuccess: 'Invitation accepted successfully',
          acceptError: 'Error accepting invitation',
          reject: 'Reject Invitation',
          rejectSuccess: 'Invitation rejected successfully',
          rejectError: 'Error rejecting invitation',
          alreadyMember: 'You are already a member of this organisation.',
          invalidLink: 'Invalid or expired invitation link',
          request: {
            title: 'Send Join Request',
            description:
              'Enter a message below to send a join request to the organisation.',
            messageLabel: 'Message',
            messagePlaceholder: 'Enter your message (optional)',
            pending:
              'You have already sent a join request to this organisation.',
            success: 'Join request sent successfully',
            error: 'Error sending join request',
          },
          requests: {
            title: 'Join Requests',
            noRequests: 'No pending join requests',
            accepted: 'Accepted',
            acceptFailed: 'Error accepting request',
            rejected: 'Rejected',
            rejectFailed: 'Error rejecting request',
          },
        },
        delete: {
          title: 'Delete Organisation',
          description:
            'Are you sure you want to delete this organisation? This action cannot be undone.',
          success: 'Organisation deleted successfully',
          error: 'Error deleting organisation',
        },
        quota: {
          members: 'Members & Invitations Quota',
          exceeded: {
            title: 'Quota Exceeded',
            description:
              'You have exceeded your organisation quota. Please contact support.',
          },
        },
        role: 'Role',
        invitationDate: 'Invitation Date',
      },
      user: {
        title: 'User',
        name: 'Full Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        organisation: 'Organisation',
        saveSuccess: 'User saved successfully',
        saveError: 'Error saving user',
        passwordsDoNotMatch: 'Passwords do not match',
        security: {
          title: 'Security',
          providers: {
            disconnect: 'Disconnect',
            disconnectSuccess: 'Provider disconnected successfully',
            disconnectError: 'Error disconnecting provider',
            password: {
              title: 'Password',
              description: 'Authenticate using a password',
              change: 'Change password',
              setup: 'Set up password',
            },
            google: {
              title: 'Google',
              description: 'Authenticate using your Google account',
            },
            apple: {
              title: 'Apple',
              description: 'Authenticate using your Apple ID',
            },
            microsoft: {
              title: 'Microsoft',
              description: 'Authenticate using your Microsoft account',
            },
          },
        },
        changePassword: {
          title: 'Change Password',
          currentPassword: 'Current Password',
          newPassword: 'New Password',
          newPasswordSameAsCurrent:
            'New password must be different from current password',
          success: 'Password changed successfully',
          error: 'Error changing password',
        },
        delete: {
          title: 'Delete User',
          description:
            'Are you sure you want to delete your account? This action cannot be undone.',
          success: 'User deleted successfully',
          error: 'Error deleting user',
        },
        verify: 'Verify',
        verificationSuccess: 'Email verified successfully',
        verificationError: 'Error verifying email',
        resendVerification: 'Resend Verification code',
        resendVerificationSuccess: 'Verification code resent successfully',
        resendVerificationError: 'Error resending verification code',
      },
      auth: {
        title: 'Authentication',
        forgotPassword: {
          title: 'Forgot Password',
          description:
            'Enter your email to receive password reset instructions.',
          success: 'Password reset instructions sent successfully',
          error: 'Error sending password reset instructions',
        },
        resetPassword: {
          title: 'Reset Password',
          description: 'Enter your new password below.',
          success: 'Password reset successfully',
          error: 'Error resetting password',
        },
        login: {
          title: 'Login',
          error: 'Login failed',
          success: 'Logged in successfully',
        },
        register: {
          title: 'Register',
          success: 'Registered successfully',
          error: 'Registration failed',
          userExists: 'User already exists',
        },
        registerWithPasskey: 'Register with Passkey',
        logout: 'Logout',
        verify: 'Verify Email',
        loginWithPasskey: 'Login with Passkey',
        loginWithGoogle: 'Login with Google',
        loginWithApple: 'Login with Apple',
        loginWithMicrosoft: 'Login with Microsoft',
      },
      about: {
        title: 'Zeity',
        description: 'Zeity is a productivity app for getting things done.',
        privacy: 'Privacy',
        terms: 'Terms of Service',
      },
      error: {
        general: {
          title: 'An Error Occurred',
          description:
            'Sorry, an unexpected error has occurred. Please try again later.',
        },
        notFound: {
          title: 'Not Found',
          description:
            "Looks like you've followed a broken link or entered a URL that doesn't exist on this site.",
        },
        serverError: {
          title: 'Server Error',
          description:
            'Sorry, there was a problem with the server. Please try again later.',
        },
        serviceUnavailable: {
          title: 'Service Unavailable',
          description:
            'Sorry, the service is currently unavailable. Please try again later.',
        },
      },
    },
    de: {
      appName: 'Zeity',
      common: {
        actions: 'Aktionen',
        add: 'Hinzufügen',
        all: 'Alle',
        back: 'Zurück',
        cancel: 'Abbrechen',
        close: 'Schließen',
        continue: 'Weiter',
        copiedToClipboard: 'In Zwischenablage kopiert',
        copyFailed: 'Kopieren fehlgeschlagen',
        custom: 'Benutzerdefiniert',
        delete: 'Löschen',
        download: 'Herunterladen',
        edit: 'Bearbeiten',
        error: 'Fehler',
        general: 'Allgemein',
        loadMore: 'Mehr laden',
        or: 'oder',
        refresh: 'Aktualisieren',
        save: 'Speichern',
        send: 'Senden',
        start: 'Start',
        stop: 'Stop',
        success: 'Erfolg',
        sync: 'Synchronisieren',
        upload: 'Hochladen',
        view: 'Anzeigen',
      },
      navigation: {
        timer: 'Timer',
        projects: 'Projekte',
        reports: 'Berichte',
        settings: 'Einstellungen',
        organisations: 'Organisationen',
        login: 'Anmelden',
        user: 'Benutzer',
        profile: 'Profil',
        about: 'Über',
        more: 'Mehr',
      },
      hints: {
        auth: {
          title: 'Sie sind abgemeldet',
          description:
            'Bitte melden Sie sich an, um Ihre Daten über Geräte hinweg zu synchronisieren und alle Funktionen von Zeity zu nutzen.',
          login: 'Anmelden',
        },
        pwaInstall: {
          title: 'Zeity installieren',
          description:
            'Für ein besseres Erlebnis installieren Sie Zeity auf Ihrem Gerät. Es funktioniert offline und lädt schneller.',
          install: 'Installieren',
        },
        pwaRefresh: {
          title: 'Update verfügbar',
          description:
            'Eine neue Version von Zeity ist verfügbar. Bitte aktualisieren Sie die Seite, um die neuesten Funktionen und Verbesserungen zu erhalten.',
          refresh: 'Aktualisieren',
        },
      },
      sync: {
        title: 'Synchronisieren',
        description:
          'Sie haben Offline {timeCount} Zeiten und {projectCount} Projekte, die synchronisiert werden müssen.',
        button: 'Jetzt synchronisieren',
        times: {
          successTitle: 'Zeiten synchronisiert',
          successMessage: '{n} Ihrer Zeiten wurden erfolgreich synchronisiert.',
          errorTitle: 'Fehler beim Synchronisieren der Zeiten',
          errorMessage:
            'Beim Synchronisieren Ihrer Zeiten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        projects: {
          successTitle: 'Projekte synchronisiert',
          successMessage:
            '{n} Ihrer Projekte wurden erfolgreich synchronisiert.',
          errorTitle: 'Fehler beim Synchronisieren der Projekte',
          errorMessage:
            'Beim Synchronisieren Ihrer Projekte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
      },
      times: {
        title: 'Zeiten',
        form: {
          startDate: 'Start Datum',
          startTime: 'Start Zeit',
          endDate: 'End Datum',
          endTime: 'End Zeit',
          project: 'Projekt',
          notes: 'Notizen',
        },
        addNotes: 'Notizen hinzufügen',
        noProject: 'Kein Projekt',
        offline: 'Zeit is nicht synchronisiert',
        dateFilter: 'Datum',
        start: 'Zeiterfassung starten',
        stop: 'Zeiterfassung stoppen',
        recordNext: 'Nächste Eintragung starten',
        round: 'Zeit runden',
        empty: {
          title: 'Keine Zeiten',
          description:
            'Es sieht so aus, als hätten Sie noch keine Zeit erfasst. Beginnen Sie mit der Zeiterfassung, indem Sie unten auf die Schaltfläche klicken.',
          actions: {
            start: 'Zeiterfassung starten',
            stop: 'Zeiterfassung stoppen',
            addTime: 'Zeit hinzufügen',
          },
        },
        type: {
          manual: 'Manuell',
          break: 'Pause',
        },
        break: {
          notes: 'Pause',
          start: 'Pause starten',
          stop: 'Pause stoppen',
          continue: 'Weiterarbeiten',
        },
      },
      projects: {
        title: 'Projekte',
        showClosed: 'Geschlossene Projekte',
        create: {
          title: 'Projekt erstellen',
        },
        edit: {
          title: 'Projekt bearbeiten',
        },
        form: {
          name: 'Name',
          status: 'Status',
          notes: 'Notizen',
        },
        status: {
          active: 'Aktiv',
          closed: 'Geschlossen',
        },
        noProjectNotes: 'Keine Notizen für dieses Projekt',
        offline: 'Projekt ist nicht synchronisiert',
        empty: {
          title: 'Keine Projekte',
          description:
            'Sie haben noch keine Projekte. Erstellen Sie eines, um zu beginnen.',
        },
      },
      reports: {
        summary: 'Zusammenfassung',
        report: 'Bericht',
        downloadError: 'Fehler beim Generieren des Berichts',
        fields: {
          user: 'Benutzer',
          start: 'Start',
          duration: 'Dauer',
          project: 'Projekt',
          notes: 'Notizen',
          type: 'Eintragstyp',
        },
      },
      offline: {
        title: 'Offline',
        description:
          'Sie sind derzeit offline. Einige Funktionen sind möglicherweise nicht verfügbar.',
      },
      organisations: {
        title: 'Organisationen',
        create: 'Organisation erstellen',
        createSuccess: 'Organisation erfolgreich erstellt',
        createError: 'Fehler beim Erstellen der Organisation',
        manage: 'Organisation verwalten',
        updateSuccess: 'Organisation erfolgreich aktualisiert',
        updateError: 'Fehler beim Aktualisieren der Organisation',
        form: {
          name: 'Name',
          namePlaceholder: 'Organisationsname eingeben',
        },
        empty: {
          title: 'Keine Organisationen',
          description:
            'Sie sind noch kein Mitglied einer Organisation. Erstellen oder treten Sie einer Organisation bei, um mit anderen zusammenzuarbeiten.',
        },
        teams: {
          title: 'Teams',
          create: 'Team erstellen',
          createSuccess: 'Team erfolgreich erstellt',
          createError: 'Fehler beim Erstellen des Teams',
          updateSuccess: 'Team erfolgreich aktualisiert',
          updateError: 'Fehler beim Aktualisieren des Teams',
          deleteSuccess: 'Team erfolgreich gelöscht',
          deleteError: 'Fehler beim Löschen des Teams',
          count: 'Keine Teams|{n} Team|{n} Teams',
          form: {
            name: 'Name',
            namePlaceholder: 'Teamnamen eingeben',
            description: 'Beschreibung',
            descriptionPlaceholder: 'Teambeschreibung eingeben',
          },
          members: {
            title: 'Mitglieder',
            add: 'Mitglied hinzufügen',
            addSuccess: 'Mitglied erfolgreich hinzugefügt',
            addError: 'Fehler beim Hinzufügen des Mitglieds',
            delete: 'Mitglied entfernen',
            deleteSuccess: 'Mitglied erfolgreich entfernt',
            deleteError: 'Fehler beim Entfernen des Mitglieds',
          },
        },
        members: {
          title: 'Mitglieder',
          count: 'Keine Mitglieder|{n} Mitglied|{n} Mitglieder',
          role: {
            owner: 'Besitzer',
            admin: 'Admin',
            member: 'Mitglied',
          },
          setRole: 'Rolle festlegen: {role}',
          roleUpdateSuccess: 'Rolle erfolgreich aktualisiert',
          roleUpdateError: 'Fehler beim Aktualisieren der Rolle',
          deleteSuccess: 'Mitglied erfolgreich gelöscht',
          deleteError: 'Fehler beim Löschen des Mitglieds',
        },
        invites: {
          title: 'Einladungen',
          create: 'Einladen',
          createSuccess: 'Einladung erfolgreich gesendet',
          createError: 'Fehler beim Senden der Einladung',
          resend: 'Erneut senden',
          resendSuccess: 'Einladung erneut gesendet',
          resendError: 'Fehler beim Senden der Einladung',
          deleteSuccess: 'Einladung erfolgreich gelöscht',
          deleteError: 'Fehler beim Löschen der Einladung',
          empty: 'Keine ausstehenden Einladungen',
        },
        join: {
          title: 'Organisation beitreten',
          description: 'Sie wurden eingeladen, {organisation} beizutreten.',
          error: 'Fehler beim Beitreten zur Organisation',
          accept: 'Einladung annehmen',
          acceptSuccess: 'Einladung erfolgreich angenommen',
          acceptError: 'Fehler beim Annehmen der Einladung',
          reject: 'Einladung ablehnen',
          rejectSuccess: 'Einladung erfolgreich abgelehnt',
          rejectError: 'Fehler beim Ablehnen der Einladung',
          alreadyMember: 'Sie sind bereits Mitglied dieser Organisation.',
          invalidLink: 'Ungültiger oder abgelaufener Einladungslink',
          request: {
            title: 'Beitrittsanfrage senden',
            description:
              'Geben Sie unten eine Nachricht ein, um eine Beitrittsanfrage an die Organisation zu senden.',
            messageLabel: 'Nachricht',
            messagePlaceholder: 'Geben Sie Ihre Nachricht ein (optional)',
            pending:
              'Sie haben bereits eine Beitrittsanfrage an diese Organisation gesendet.',
            success: 'Beitrittsanfrage erfolgreich gesendet',
            error: 'Fehler beim Senden der Beitrittsanfrage',
          },
          requests: {
            title: 'Beitrittsanfragen',
            noRequests: 'Keine ausstehenden Beitrittsanfragen',
            accepted: 'Akzeptiert',
            acceptFailed: 'Fehler beim Akzeptieren der Anfrage',
            rejected: 'Abgelehnt',
            rejectFailed: 'Fehler beim Ablehnen der Anfrage',
          },
        },
        delete: {
          title: 'Organisation löschen',
          description:
            'Möchten Sie diese Organisation wirklich löschen? Dies kann nicht rückgängig gemacht werden.',
          success: 'Organisation erfolgreich gelöscht',
          error: 'Fehler beim Löschen der Organisation',
        },
        quota: {
          members: 'Mitglieder & Einladungen Kontingent',
          exceeded: {
            title: 'Kontingent überschritten',
            description:
              'Sie haben Ihr Organisationskontingent überschritten. Bitte kontaktieren Sie den Support.',
          },
        },
        role: 'Rolle',
        invitationDate: 'Einladungsdatum',
      },
      user: {
        title: 'Benutzer',
        name: 'Vollständiger Name',
        email: 'Email',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        organisation: 'Organisation',
        saveSuccess: 'Benutzer erfolgreich gespeichert',
        saveError: 'Fehler beim Speichern des Benutzers',
        passwordsDoNotMatch: 'Passwörter stimmen nicht überein',
        security: {
          title: 'Sicherheit',
          providers: {
            disconnect: 'Trennen',
            disconnectSuccess: 'Anbieter erfolgreich getrennt',
            disconnectError: 'Fehler beim Trennen des Anbieters',
            password: {
              title: 'Passwort',
              description: 'Mit einem Passwort authentifizieren',
              change: 'Passwort ändern',
              setup: 'Passwort einrichten',
            },
            google: {
              title: 'Google',
              description: 'Mit Ihrem Google-Konto authentifizieren',
            },
            apple: {
              title: 'Apple',
              description: 'Mit Ihrer Apple-ID authentifizieren',
            },
            microsoft: {
              title: 'Microsoft',
              description: 'Mit Ihrem Microsoft-Konto authentifizieren',
            },
          },
        },
        changePassword: {
          title: 'Passwort ändern',
          currentPassword: 'Aktuelles Passwort',
          newPassword: 'Neues Passwort',
          newPasswordSameAsCurrent:
            'Neues Passwort muss sich vom aktuellen Passwort unterscheiden',
          success: 'Passwort erfolgreich geändert',
          error: 'Fehler beim Ändern des Passworts',
        },
        delete: {
          title: 'Benutzer löschen',
          description:
            'Möchten Sie diesen Benutzer wirklich löschen? Dies kann nicht rückgängig gemacht werden.',
          success: 'Benutzer erfolgreich gelöscht',
          error: 'Fehler beim Löschen des Benutzers',
        },
        verify: 'Verifizieren',
        verificationSuccess: 'E-Mail erfolgreich verifiziert',
        verificationError: 'Fehler bei der E-Mail-Verifizierung',
        resendVerification: 'Code erneut senden',
        resendVerificationSuccess: 'Verifizierungscode erneut gesendet',
        resendVerificationError: 'Fehler beim Senden des Verifizierungscodes',
      },
      auth: {
        title: 'Authentifizierung',
        forgotPassword: {
          title: 'Passwort vergessen',
          description:
            'Geben Sie Ihre E-Mail-Adresse ein, um Anweisungen zum Zurücksetzen des Passworts zu erhalten.',
          success:
            'Anweisungen zum Zurücksetzen des Passworts erfolgreich gesendet',
          error:
            'Fehler beim Senden der Anweisungen zum Zurücksetzen des Passworts',
        },
        resetPassword: {
          title: 'Passwort zurücksetzen',
          description: 'Geben Sie unten Ihr neues Passwort ein.',
          success: 'Passwort erfolgreich zurückgesetzt',
          error: 'Fehler beim Zurücksetzen des Passworts',
        },
        login: {
          title: 'Anmelden',
          error: 'Anmeldung fehlgeschlagen',
          success: 'Erfolgreich angemeldet',
        },
        register: {
          title: 'Registrieren',
          error: 'Registrierung fehlgeschlagen',
          success: 'Erfolgreich registriert',
          userExists: 'Benutzer existiert bereits',
        },
        registerWithPasskey: 'Mit Passkey registrieren',
        logout: 'Abmelden',
        verify: 'E-Mail verifizieren',
        loginWithPasskey: 'Mit Passkey anmelden',
        loginWithGoogle: 'Mit Google anmelden',
        loginWithApple: 'Mit Apple anmelden',
        loginWithMicrosoft: 'Mit Microsoft anmelden',
      },
      settings: {
        title: 'Einstellungen',
        general: 'Allgemein',
        language: 'Sprache',
        appearance: 'Erscheinungsbild',
        theme: 'Thema',
        light: 'Hell',
        dark: 'Dunkel',
        auto: 'Automatisch',
        color: 'Farbe',
        data: 'Daten',
        import: 'Importieren',
        export: 'Exportieren',
        time: {
          title: 'Timer',
          detailsOnStart: 'Details beim Start einblenden',
          detailsOnStop: 'Details beim Stoppen einblenden',
          calculateBreaks: 'Pausen berechnen',
          roundTimes: 'Zeiten automatisch aufrunden',
        },
      },
      about: {
        title: 'Zeity',
        description:
          'Zeity ist eine Produktivitäts-App zum Erledigen von Aufgaben.',
        privacy: 'Datenschutz',
        terms: 'Nutzungsbedingungen',
      },
      error: {
        general: {
          title: 'Ein Fehler ist aufgetreten',
          description:
            'Entschuldigung, ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
        },
        notFound: {
          title: 'Nicht gefunden',
          description:
            'Es sieht so aus, als wären Sie einem defekten Link gefolgt oder hätten eine URL eingegeben, die auf dieser Seite nicht existiert.',
        },
        serverError: {
          title: 'Serverfehler',
          description:
            'Entschuldigung, es gab ein Problem mit dem Server. Bitte versuchen Sie es später erneut.',
        },
        serviceUnavailable: {
          title: 'Dienst nicht verfügbar',
          description:
            'Entschuldigung, der Dienst ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
        },
      },
    },
  },
}));
